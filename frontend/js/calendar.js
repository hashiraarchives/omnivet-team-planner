// Calendar Manager

class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.schedules = [];
    this.selectedDate = null;

    this.init();
  }

  init() {
    // Navigation buttons
    document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

    // Modal handlers
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('closeEditModal').addEventListener('click', () => this.closeEditModal());

    // Close modals on overlay click
    document.getElementById('dayModal').addEventListener('click', (e) => {
      if (e.target.id === 'dayModal') this.closeModal();
    });
    document.getElementById('editModal').addEventListener('click', (e) => {
      if (e.target.id === 'editModal') this.closeEditModal();
    });

    // Schedule form submission
    document.getElementById('scheduleForm').addEventListener('submit', (e) => this.handleScheduleSubmit(e));

    // Edit form submission
    document.getElementById('editScheduleForm').addEventListener('submit', (e) => this.handleEditSubmit(e));
    document.getElementById('deleteScheduleBtn').addEventListener('click', () => this.handleDelete());

    // Initial render
    this.render();
  }

  async render() {
    this.updateHeader();
    await this.loadSchedules();
    this.renderDays();
  }

  updateHeader() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    document.getElementById('currentMonth').textContent = `${months[this.currentMonth]} ${this.currentYear}`;
  }

  async loadSchedules() {
    try {
      const response = await API.getSchedulesForMonth(this.currentMonth + 1, this.currentYear);
      if (response.success) {
        this.schedules = response.schedules;
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      this.schedules = [];
    }
  }

  renderDays() {
    const container = document.getElementById('calendarDays');
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
        const scheduleDate = new Date(s.date).toISOString().split('T')[0];
        return scheduleDate === dateStr;
      });

      const dayEl = this.createDayElement(day, false, isToday, daySchedules, dateStr);
      container.appendChild(dayEl);
    }

    // Next month days
    const remainingDays = 42 - (startingDay + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
      const dayEl = this.createDayElement(day, true);
      container.appendChild(dayEl);
    }
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

    dayEl.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="day-volunteers"></div>
    `;

    if (!isOtherMonth && dateStr) {
      dayEl.addEventListener('click', () => this.openDayModal(dateStr));

      // Render mini avatars
      const volunteersContainer = dayEl.querySelector('.day-volunteers');
      const maxDisplay = 3;

      schedules.slice(0, maxDisplay).forEach(schedule => {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'mini-avatar';

        const avatarData = typeof schedule.avatar_data === 'string'
          ? JSON.parse(schedule.avatar_data)
          : schedule.avatar_data;

        const avatar = new AvatarCreator(avatarDiv, true);
        avatar.setOptions(avatarData);
        volunteersContainer.appendChild(avatarDiv);
      });

      if (schedules.length > maxDisplay) {
        const countEl = document.createElement('div');
        countEl.className = 'volunteer-count';
        countEl.textContent = `+${schedules.length - maxDisplay} more`;
        volunteersContainer.appendChild(countEl);
      }
    }

    return dayEl;
  }

  async openDayModal(dateStr) {
    this.selectedDate = dateStr;

    // Format date for display
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('modalDate').textContent = date.toLocaleDateString('en-US', options);

    // Load schedules for this date
    try {
      const response = await API.getSchedulesForDate(dateStr);
      if (response.success) {
        this.renderVolunteersList(response.schedules);
      }
    } catch (error) {
      console.error('Failed to load schedules for date:', error);
    }

    // Reset form
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleError').classList.add('hidden');

    // Show modal
    document.getElementById('dayModal').classList.remove('hidden');
  }

  renderVolunteersList(schedules) {
    const container = document.getElementById('volunteersList');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (schedules.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No volunteers scheduled for this day yet.</p>';
      return;
    }

    container.innerHTML = schedules.map(schedule => {
      const avatarData = typeof schedule.avatar_data === 'string'
        ? JSON.parse(schedule.avatar_data)
        : schedule.avatar_data;

      const isOwn = schedule.user_id === currentUser.id;
      const editBtn = isOwn
        ? `<button class="btn btn-tiny btn-secondary edit-btn" onclick="calendar.openEditModal(${schedule.id}, '${schedule.start_time}', '${schedule.end_time}', '${(schedule.description || '').replace(/'/g, "\\'")}')">Edit</button>`
        : '';

      return `
        <div class="volunteer-item">
          <div class="mini-avatar" data-avatar='${JSON.stringify(avatarData)}'></div>
          <div class="volunteer-info">
            <div class="volunteer-name">${this.escapeHtml(schedule.name)}${isOwn ? ' (You)' : ''}</div>
            <div class="volunteer-time">${this.formatTime(schedule.start_time)} - ${this.formatTime(schedule.end_time)}</div>
            ${schedule.description ? `<div class="volunteer-description">${this.escapeHtml(schedule.description)}</div>` : ''}
          </div>
          ${editBtn}
        </div>
      `;
    }).join('');

    // Render avatars
    container.querySelectorAll('.mini-avatar').forEach(el => {
      const data = JSON.parse(el.dataset.avatar || '{}');
      const avatar = new AvatarCreator(el, true);
      avatar.setOptions(data);
    });
  }

  closeModal() {
    document.getElementById('dayModal').classList.add('hidden');
    this.selectedDate = null;
  }

  async handleScheduleSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('scheduleError');

    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('description').value;

    if (!startTime || !endTime) {
      errorEl.textContent = 'Please select both start and end times.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (startTime >= endTime) {
      errorEl.textContent = 'End time must be after start time.';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const response = await API.createSchedule(this.selectedDate, startTime, endTime, description);
      if (response.success) {
        this.closeModal();
        await this.render();
      }
    } catch (error) {
      errorEl.textContent = error.message || 'Failed to create schedule.';
      errorEl.classList.remove('hidden');
    }
  }

  openEditModal(scheduleId, startTime, endTime, description) {
    document.getElementById('editScheduleId').value = scheduleId;
    document.getElementById('editStartTime').value = startTime;
    document.getElementById('editEndTime').value = endTime;
    document.getElementById('editDescription').value = description;
    document.getElementById('editError').classList.add('hidden');

    document.getElementById('editModal').classList.remove('hidden');
  }

  closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
  }

  async handleEditSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('editError');

    const scheduleId = document.getElementById('editScheduleId').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    const description = document.getElementById('editDescription').value;

    if (startTime >= endTime) {
      errorEl.textContent = 'End time must be after start time.';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const response = await API.updateSchedule(scheduleId, {
        start_time: startTime,
        end_time: endTime,
        description
      });

      if (response.success) {
        this.closeEditModal();
        await this.render();
        // Reopen day modal to show updated list
        if (this.selectedDate) {
          await this.openDayModal(this.selectedDate);
        }
      }
    } catch (error) {
      errorEl.textContent = error.message || 'Failed to update schedule.';
      errorEl.classList.remove('hidden');
    }
  }

  async handleDelete() {
    const scheduleId = document.getElementById('editScheduleId').value;

    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await API.deleteSchedule(scheduleId);
      if (response.success) {
        this.closeEditModal();
        await this.render();
        // Reopen day modal to show updated list
        if (this.selectedDate) {
          await this.openDayModal(this.selectedDate);
        }
      }
    } catch (error) {
      document.getElementById('editError').textContent = error.message || 'Failed to delete schedule.';
      document.getElementById('editError').classList.remove('hidden');
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

// Make calendar instance globally accessible for inline event handlers
let calendar;
