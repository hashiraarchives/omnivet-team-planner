// Calendar Manager - Futuristic Edition

class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.schedules = [];
    this.selectedDate = null;

    console.log('Calendar initialized:', this.currentMonth + 1, this.currentYear);
    this.init();
  }

  init() {
    try {
      // Navigation buttons
      const prevBtn = document.getElementById('prevMonth');
      const nextBtn = document.getElementById('nextMonth');
      const todayBtn = document.getElementById('todayBtn');

      if (prevBtn) prevBtn.addEventListener('click', () => this.changeMonth(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => this.changeMonth(1));
      if (todayBtn) todayBtn.addEventListener('click', () => this.goToToday());

      // Modal handlers
      const closeModal = document.getElementById('closeModal');
      const closeEditModal = document.getElementById('closeEditModal');
      const dayModal = document.getElementById('dayModal');
      const editModal = document.getElementById('editModal');

      if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
      if (closeEditModal) closeEditModal.addEventListener('click', () => this.closeEditModal());

      // Close modals on overlay click
      if (dayModal) {
        dayModal.addEventListener('click', (e) => {
          if (e.target.id === 'dayModal') this.closeModal();
        });
      }
      if (editModal) {
        editModal.addEventListener('click', (e) => {
          if (e.target.id === 'editModal') this.closeEditModal();
        });
      }

      // Schedule form submission
      const scheduleForm = document.getElementById('scheduleForm');
      if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => this.handleScheduleSubmit(e));
      }

      // Edit form submission
      const editForm = document.getElementById('editScheduleForm');
      const deleteBtn = document.getElementById('deleteScheduleBtn');
      if (editForm) {
        editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.handleDelete());
      }

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
          this.closeEditModal();
        }
      });

      // Initial render
      this.render();

    } catch (error) {
      console.error('Calendar init error:', error);
    }
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.render();
  }

  async render() {
    console.log('Rendering calendar for:', this.currentMonth + 1, this.currentYear);
    this.updateHeader();
    await this.loadSchedules();
    this.renderDays();
  }

  updateHeader() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const headerEl = document.getElementById('currentMonth');
    if (headerEl) {
      headerEl.textContent = `${months[this.currentMonth]} ${this.currentYear}`;
    }
  }

  async loadSchedules() {
    try {
      const response = await API.getSchedulesForMonth(this.currentMonth + 1, this.currentYear);
      if (response && response.success) {
        this.schedules = response.schedules || [];
        console.log('Loaded schedules:', this.schedules.length);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      this.schedules = [];
    }
  }

  renderDays() {
    const container = document.getElementById('calendarDays');
    if (!container) {
      console.error('Calendar container not found');
      return;
    }

    container.innerHTML = '';

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Previous month days
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dayEl = this.createDayElement(day, true);
      container.appendChild(dayEl);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const isToday =
        day === today.getDate() &&
        this.currentMonth === today.getMonth() &&
        this.currentYear === today.getFullYear();

      const dateStr = this.formatDate(this.currentYear, this.currentMonth + 1, day);
      const daySchedules = this.schedules.filter(s => {
        if (!s.date) return false;
        const scheduleDate = new Date(s.date).toISOString().split('T')[0];
        return scheduleDate === dateStr;
      });

      const dayEl = this.createDayElement(day, false, isToday, daySchedules, dateStr);
      container.appendChild(dayEl);
    }

    // Next month days to fill grid (6 rows x 7 days = 42)
    const totalCells = startingDay + totalDays;
    const remainingDays = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let day = 1; day <= remainingDays; day++) {
      const dayEl = this.createDayElement(day, true);
      container.appendChild(dayEl);
    }

    console.log('Rendered days:', totalDays);
  }

  createDayElement(day, isOtherMonth, isToday = false, schedules = [], dateStr = null) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }
    if (isToday) {
      dayEl.classList.add('today');
    }
    if (schedules.length > 0) {
      dayEl.classList.add('has-schedules');
    }

    // Build inner HTML
    let html = `<div class="day-number">${day}</div>`;

    if (!isOtherMonth && schedules.length > 0) {
      html += '<div class="day-volunteers">';
      const maxDisplay = 3;

      schedules.slice(0, maxDisplay).forEach((schedule, index) => {
        html += `<div class="mini-avatar" data-schedule-index="${index}"></div>`;
      });

      if (schedules.length > maxDisplay) {
        html += `<div class="more-count">+${schedules.length - maxDisplay}</div>`;
      }
      html += '</div>';
    }

    dayEl.innerHTML = html;

    // Add click handler for current month days
    if (!isOtherMonth && dateStr) {
      dayEl.addEventListener('click', () => this.openDayModal(dateStr));
      dayEl.style.cursor = 'pointer';

      // Render avatars after adding to DOM
      setTimeout(() => {
        const avatarDivs = dayEl.querySelectorAll('.mini-avatar');
        avatarDivs.forEach((div, index) => {
          if (schedules[index]) {
            try {
              const avatarData = typeof schedules[index].avatar_data === 'string'
                ? JSON.parse(schedules[index].avatar_data)
                : schedules[index].avatar_data;
              const avatar = new AvatarCreator(div, true);
              avatar.setOptions(avatarData || {});
            } catch (e) {
              console.error('Avatar error:', e);
            }
          }
        });
      }, 0);
    }

    return dayEl;
  }

  async openDayModal(dateStr) {
    this.selectedDate = dateStr;

    // Format date for display
    const date = new Date(dateStr + 'T12:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const modalDate = document.getElementById('modalDate');
    const modalSubtitle = document.getElementById('modalSubtitle');

    if (modalDate) modalDate.textContent = formattedDate;
    if (modalSubtitle) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      modalSubtitle.textContent = `Schedule your volunteer shift`;
    }

    // Load schedules for this date
    try {
      const response = await API.getSchedulesForDate(dateStr);
      if (response && response.success) {
        this.renderVolunteersList(response.schedules || []);
      }
    } catch (error) {
      console.error('Failed to load schedules for date:', error);
      this.renderVolunteersList([]);
    }

    // Reset form
    const form = document.getElementById('scheduleForm');
    if (form) form.reset();

    const errorEl = document.getElementById('scheduleError');
    if (errorEl) errorEl.classList.add('hidden');

    // Show modal
    const modal = document.getElementById('dayModal');
    if (modal) modal.classList.remove('hidden');
  }

  renderVolunteersList(schedules) {
    const container = document.getElementById('volunteersList');
    if (!container) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!schedules || schedules.length === 0) {
      container.innerHTML = '<div class="empty-state">No volunteers scheduled yet. Be the first!</div>';
      return;
    }

    container.innerHTML = schedules.map(schedule => {
      const avatarData = typeof schedule.avatar_data === 'string'
        ? JSON.parse(schedule.avatar_data || '{}')
        : (schedule.avatar_data || {});

      const isOwn = schedule.user_id === currentUser.id;
      const editBtn = isOwn
        ? `<button class="btn btn-edit" onclick="window.calendar.openEditModal(${schedule.id}, '${schedule.start_time}', '${schedule.end_time}', '${(schedule.description || '').replace(/'/g, "\\'")}')">Edit</button>`
        : '';

      return `
        <div class="volunteer-item ${isOwn ? 'own-schedule' : ''}">
          <div class="volunteer-avatar" data-avatar='${JSON.stringify(avatarData)}'></div>
          <div class="volunteer-info">
            <div class="volunteer-name">${this.escapeHtml(schedule.name)}${isOwn ? ' <span class="you-badge">You</span>' : ''}</div>
            <div class="volunteer-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              ${this.formatTime(schedule.start_time)} - ${this.formatTime(schedule.end_time)}
            </div>
            ${schedule.description ? `<div class="volunteer-notes">${this.escapeHtml(schedule.description)}</div>` : ''}
          </div>
          ${editBtn}
        </div>
      `;
    }).join('');

    // Render avatars
    container.querySelectorAll('.volunteer-avatar').forEach(el => {
      try {
        const data = JSON.parse(el.dataset.avatar || '{}');
        const avatar = new AvatarCreator(el, true);
        avatar.setOptions(data);
      } catch (e) {
        console.error('Avatar render error:', e);
      }
    });
  }

  closeModal() {
    const modal = document.getElementById('dayModal');
    if (modal) modal.classList.add('hidden');
    this.selectedDate = null;
  }

  async handleScheduleSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('scheduleError');

    const startTime = document.getElementById('startTime')?.value;
    const endTime = document.getElementById('endTime')?.value;
    const description = document.getElementById('description')?.value || '';

    if (!startTime || !endTime) {
      if (errorEl) {
        errorEl.textContent = 'Please select both start and end times.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (startTime >= endTime) {
      if (errorEl) {
        errorEl.textContent = 'End time must be after start time.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    try {
      const response = await API.createSchedule(this.selectedDate, startTime, endTime, description);
      if (response && response.success) {
        this.closeModal();
        await this.render();
      }
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to create schedule.';
        errorEl.classList.remove('hidden');
      }
    }
  }

  openEditModal(scheduleId, startTime, endTime, description) {
    const idEl = document.getElementById('editScheduleId');
    const startEl = document.getElementById('editStartTime');
    const endEl = document.getElementById('editEndTime');
    const descEl = document.getElementById('editDescription');
    const errorEl = document.getElementById('editError');

    if (idEl) idEl.value = scheduleId;
    if (startEl) startEl.value = startTime;
    if (endEl) endEl.value = endTime;
    if (descEl) descEl.value = description;
    if (errorEl) errorEl.classList.add('hidden');

    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.add('hidden');
  }

  async handleEditSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('editError');

    const scheduleId = document.getElementById('editScheduleId')?.value;
    const startTime = document.getElementById('editStartTime')?.value;
    const endTime = document.getElementById('editEndTime')?.value;
    const description = document.getElementById('editDescription')?.value || '';

    if (startTime >= endTime) {
      if (errorEl) {
        errorEl.textContent = 'End time must be after start time.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    try {
      const response = await API.updateSchedule(scheduleId, {
        start_time: startTime,
        end_time: endTime,
        description
      });

      if (response && response.success) {
        this.closeEditModal();
        await this.render();
        if (this.selectedDate) {
          await this.openDayModal(this.selectedDate);
        }
      }
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to update schedule.';
        errorEl.classList.remove('hidden');
      }
    }
  }

  async handleDelete() {
    const scheduleId = document.getElementById('editScheduleId')?.value;

    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      const response = await API.deleteSchedule(scheduleId);
      if (response && response.success) {
        this.closeEditModal();
        await this.render();
        if (this.selectedDate) {
          await this.openDayModal(this.selectedDate);
        }
      }
    } catch (error) {
      const errorEl = document.getElementById('editError');
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to delete schedule.';
        errorEl.classList.remove('hidden');
      }
    }
  }

  changeMonth(delta) {
    this.currentMonth += delta;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.render();
  }

  formatDate(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}

// Global reference
window.Calendar = Calendar;
