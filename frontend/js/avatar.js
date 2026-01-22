// Avatar Creator and Renderer

class AvatarCreator {
  constructor(containerId, isMini = false) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    this.isMini = isMini;

    this.options = {
      faceShape: 'round',
      skinTone: '#F5D0C5',
      hairStyle: 'short',
      hairColor: '#3D2314',
      eyes: 'round',
      eyebrows: 'thick',
      mouth: 'smile',
      accessory: 'none'
    };

    this.render();
  }

  setOption(key, value) {
    this.options[key] = value;
    this.render();
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }

  getOptions() {
    return { ...this.options };
  }

  randomize() {
    const faceShapes = ['round', 'oval', 'square', 'heart'];
    const skinTones = ['#FDEBD0', '#F5D0C5', '#D4A574', '#C68642', '#8D5524', '#5C3A21'];
    const hairStyles = ['short', 'medium', 'long', 'curly', 'wavy', 'bun', 'ponytail', 'bald'];
    const hairColors = ['#1C1C1C', '#3D2314', '#D4A76A', '#B55239', '#8B8B8B', '#4A90D9', '#E57BA6', '#9B59B6'];
    const eyes = ['round', 'almond', 'cat', 'wide', 'sleepy', 'sparkle'];
    const eyebrows = ['thin', 'thick', 'arched', 'straight', 'expressive'];
    const mouths = ['smile', 'grin', 'neutral', 'smirk', 'open'];
    const accessories = ['none', 'glasses', 'sunglasses', 'hat', 'headband', 'earrings'];

    const random = arr => arr[Math.floor(Math.random() * arr.length)];

    this.options = {
      faceShape: random(faceShapes),
      skinTone: random(skinTones),
      hairStyle: random(hairStyles),
      hairColor: random(hairColors),
      eyes: random(eyes),
      eyebrows: random(eyebrows),
      mouth: random(mouths),
      accessory: random(accessories)
    };

    this.render();
  }

  render() {
    if (!this.container) return;

    const size = this.isMini ? 100 : 200;
    const scale = size / 200;

    const svg = `
      <svg class="avatar-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="faceClip-${this.container.id || 'avatar'}">
            ${this.getFaceClipPath()}
          </clipPath>
        </defs>

        <!-- Background -->
        <circle cx="100" cy="100" r="95" fill="#E8E8F0"/>

        <!-- Hair Back (for long styles) -->
        ${this.getHairBack()}

        <!-- Face -->
        <g clip-path="url(#faceClip-${this.container.id || 'avatar'})">
          ${this.getFace()}
        </g>

        <!-- Ears -->
        ${this.getEars()}

        <!-- Eyes -->
        ${this.getEyes()}

        <!-- Eyebrows -->
        ${this.getEyebrows()}

        <!-- Nose -->
        ${this.getNose()}

        <!-- Mouth -->
        ${this.getMouth()}

        <!-- Hair Front -->
        ${this.getHairFront()}

        <!-- Accessories -->
        ${this.getAccessory()}
      </svg>
    `;

    this.container.innerHTML = svg;
  }

  getFaceClipPath() {
    const shapes = {
      round: '<circle cx="100" cy="105" r="65"/>',
      oval: '<ellipse cx="100" cy="105" rx="55" ry="70"/>',
      square: '<rect x="40" y="40" width="120" height="130" rx="20"/>',
      heart: '<path d="M100 170 C40 130 30 80 50 60 C70 40 100 55 100 75 C100 55 130 40 150 60 C170 80 160 130 100 170Z"/>'
    };
    return shapes[this.options.faceShape] || shapes.round;
  }

  getFace() {
    const { skinTone, faceShape } = this.options;
    const shapes = {
      round: `<circle cx="100" cy="105" r="65" fill="${skinTone}"/>`,
      oval: `<ellipse cx="100" cy="105" rx="55" ry="70" fill="${skinTone}"/>`,
      square: `<rect x="40" y="40" width="120" height="130" rx="20" fill="${skinTone}"/>`,
      heart: `<path d="M100 170 C40 130 30 80 50 60 C70 40 100 55 100 75 C100 55 130 40 150 60 C170 80 160 130 100 170Z" fill="${skinTone}"/>`
    };
    return shapes[faceShape] || shapes.round;
  }

  getEars() {
    const { skinTone } = this.options;
    return `
      <ellipse cx="35" cy="105" rx="10" ry="15" fill="${skinTone}"/>
      <ellipse cx="165" cy="105" rx="10" ry="15" fill="${skinTone}"/>
    `;
  }

  getEyes() {
    const { eyes } = this.options;
    const eyeStyles = {
      round: `
        <circle cx="70" cy="100" r="12" fill="white"/>
        <circle cx="130" cy="100" r="12" fill="white"/>
        <circle cx="70" cy="100" r="6" fill="#3D2314"/>
        <circle cx="130" cy="100" r="6" fill="#3D2314"/>
        <circle cx="72" cy="98" r="2" fill="white"/>
        <circle cx="132" cy="98" r="2" fill="white"/>
      `,
      almond: `
        <ellipse cx="70" cy="100" rx="14" ry="8" fill="white"/>
        <ellipse cx="130" cy="100" rx="14" ry="8" fill="white"/>
        <circle cx="70" cy="100" r="5" fill="#3D2314"/>
        <circle cx="130" cy="100" r="5" fill="#3D2314"/>
      `,
      cat: `
        <path d="M56 100 Q70 92 84 100 Q70 108 56 100" fill="white"/>
        <path d="M116 100 Q130 92 144 100 Q130 108 116 100" fill="white"/>
        <ellipse cx="70" cy="100" rx="4" ry="6" fill="#2D8B3D"/>
        <ellipse cx="130" cy="100" rx="4" ry="6" fill="#2D8B3D"/>
      `,
      wide: `
        <ellipse cx="70" cy="100" rx="16" ry="14" fill="white"/>
        <ellipse cx="130" cy="100" rx="16" ry="14" fill="white"/>
        <circle cx="70" cy="100" r="8" fill="#3D2314"/>
        <circle cx="130" cy="100" r="8" fill="#3D2314"/>
        <circle cx="73" cy="97" r="3" fill="white"/>
        <circle cx="133" cy="97" r="3" fill="white"/>
      `,
      sleepy: `
        <path d="M56 100 Q70 95 84 100" fill="none" stroke="#3D2314" stroke-width="3" stroke-linecap="round"/>
        <path d="M116 100 Q130 95 144 100" fill="none" stroke="#3D2314" stroke-width="3" stroke-linecap="round"/>
      `,
      sparkle: `
        <circle cx="70" cy="100" r="12" fill="white"/>
        <circle cx="130" cy="100" r="12" fill="white"/>
        <circle cx="70" cy="100" r="7" fill="#6366F1"/>
        <circle cx="130" cy="100" r="7" fill="#6366F1"/>
        <circle cx="67" cy="97" r="3" fill="white"/>
        <circle cx="127" cy="97" r="3" fill="white"/>
        <circle cx="73" cy="103" r="1.5" fill="white"/>
        <circle cx="133" cy="103" r="1.5" fill="white"/>
      `
    };
    return eyeStyles[eyes] || eyeStyles.round;
  }

  getEyebrows() {
    const { eyebrows, hairColor } = this.options;
    const browStyles = {
      thin: `
        <path d="M55 85 Q70 82 85 85" fill="none" stroke="${hairColor}" stroke-width="2" stroke-linecap="round"/>
        <path d="M115 85 Q130 82 145 85" fill="none" stroke="${hairColor}" stroke-width="2" stroke-linecap="round"/>
      `,
      thick: `
        <path d="M55 85 Q70 80 85 85" fill="none" stroke="${hairColor}" stroke-width="4" stroke-linecap="round"/>
        <path d="M115 85 Q130 80 145 85" fill="none" stroke="${hairColor}" stroke-width="4" stroke-linecap="round"/>
      `,
      arched: `
        <path d="M55 88 Q70 78 85 85" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
        <path d="M115 85 Q130 78 145 88" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
      `,
      straight: `
        <line x1="55" y1="85" x2="85" y2="85" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
        <line x1="115" y1="85" x2="145" y2="85" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
      `,
      expressive: `
        <path d="M55 88 Q65 78 75 82 Q80 84 85 82" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
        <path d="M115 82 Q120 84 125 82 Q135 78 145 88" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round"/>
      `
    };
    return browStyles[eyebrows] || browStyles.thick;
  }

  getNose() {
    const { skinTone } = this.options;
    const darkerTone = this.darkenColor(skinTone, 20);
    return `
      <path d="M100 108 L95 125 Q100 128 105 125 L100 108" fill="${darkerTone}" opacity="0.3"/>
    `;
  }

  getMouth() {
    const { mouth } = this.options;
    const mouthStyles = {
      smile: `<path d="M80 140 Q100 155 120 140" fill="none" stroke="#C44569" stroke-width="3" stroke-linecap="round"/>`,
      grin: `
        <path d="M75 138 Q100 160 125 138" fill="white" stroke="#C44569" stroke-width="2"/>
        <path d="M80 138 Q100 145 120 138" fill="#C44569"/>
      `,
      neutral: `<line x1="85" y1="142" x2="115" y2="142" stroke="#C44569" stroke-width="3" stroke-linecap="round"/>`,
      smirk: `<path d="M85 140 Q105 145 120 138" fill="none" stroke="#C44569" stroke-width="3" stroke-linecap="round"/>`,
      open: `
        <ellipse cx="100" cy="145" rx="15" ry="10" fill="#8B4553"/>
        <ellipse cx="100" cy="140" rx="12" ry="5" fill="white"/>
      `
    };
    return mouthStyles[mouth] || mouthStyles.smile;
  }

  getHairBack() {
    const { hairStyle, hairColor } = this.options;
    if (hairStyle === 'bald') return '';

    const backStyles = {
      long: `<path d="M35 70 Q35 180 100 190 Q165 180 165 70" fill="${hairColor}"/>`,
      wavy: `<path d="M30 70 Q25 140 50 180 Q75 200 100 195 Q125 200 150 180 Q175 140 170 70" fill="${hairColor}"/>`,
      ponytail: `
        <ellipse cx="100" cy="35" rx="20" ry="10" fill="${hairColor}"/>
        <path d="M85 35 Q80 80 90 140 Q100 160 110 140 Q120 80 115 35" fill="${hairColor}"/>
      `
    };
    return backStyles[hairStyle] || '';
  }

  getHairFront() {
    const { hairStyle, hairColor } = this.options;

    if (hairStyle === 'bald') {
      return `<ellipse cx="100" cy="50" rx="60" ry="15" fill="${this.options.skinTone}" opacity="0.3"/>`;
    }

    const hairStyles = {
      short: `
        <path d="M40 80 Q40 35 100 30 Q160 35 160 80 Q150 60 100 55 Q50 60 40 80" fill="${hairColor}"/>
        <path d="M45 75 Q55 50 100 45 Q145 50 155 75 Q140 55 100 50 Q60 55 45 75" fill="${hairColor}"/>
      `,
      medium: `
        <path d="M35 90 Q35 30 100 25 Q165 30 165 90 Q155 50 100 45 Q45 50 35 90" fill="${hairColor}"/>
        <path d="M35 90 Q40 100 45 95" fill="${hairColor}"/>
        <path d="M165 90 Q160 100 155 95" fill="${hairColor}"/>
      `,
      long: `
        <path d="M35 85 Q35 25 100 20 Q165 25 165 85 Q155 45 100 40 Q45 45 35 85" fill="${hairColor}"/>
      `,
      curly: `
        <circle cx="50" cy="55" r="18" fill="${hairColor}"/>
        <circle cx="80" cy="40" r="20" fill="${hairColor}"/>
        <circle cx="100" cy="35" r="18" fill="${hairColor}"/>
        <circle cx="120" cy="40" r="20" fill="${hairColor}"/>
        <circle cx="150" cy="55" r="18" fill="${hairColor}"/>
        <circle cx="40" cy="80" r="15" fill="${hairColor}"/>
        <circle cx="160" cy="80" r="15" fill="${hairColor}"/>
        <circle cx="35" cy="105" r="12" fill="${hairColor}"/>
        <circle cx="165" cy="105" r="12" fill="${hairColor}"/>
      `,
      wavy: `
        <path d="M35 85 Q35 25 100 20 Q165 25 165 85 Q155 45 100 40 Q45 45 35 85" fill="${hairColor}"/>
        <path d="M35 85 Q30 95 35 110 Q40 95 35 85" fill="${hairColor}"/>
        <path d="M165 85 Q170 95 165 110 Q160 95 165 85" fill="${hairColor}"/>
      `,
      bun: `
        <path d="M40 80 Q40 35 100 30 Q160 35 160 80 Q150 60 100 55 Q50 60 40 80" fill="${hairColor}"/>
        <circle cx="100" cy="25" r="25" fill="${hairColor}"/>
        <ellipse cx="100" cy="25" rx="20" ry="18" fill="${this.darkenColor(hairColor, -15)}"/>
      `,
      ponytail: `
        <path d="M40 80 Q40 35 100 30 Q160 35 160 80 Q150 60 100 55 Q50 60 40 80" fill="${hairColor}"/>
      `
    };

    return hairStyles[hairStyle] || hairStyles.short;
  }

  getAccessory() {
    const { accessory, hairColor } = this.options;

    const accessories = {
      none: '',
      glasses: `
        <circle cx="70" cy="100" r="18" fill="none" stroke="#333" stroke-width="3"/>
        <circle cx="130" cy="100" r="18" fill="none" stroke="#333" stroke-width="3"/>
        <line x1="88" y1="100" x2="112" y2="100" stroke="#333" stroke-width="3"/>
        <line x1="52" y1="100" x2="35" y2="95" stroke="#333" stroke-width="3"/>
        <line x1="148" y1="100" x2="165" y2="95" stroke="#333" stroke-width="3"/>
      `,
      sunglasses: `
        <path d="M52 90 L52 110 Q70 120 88 110 L88 90 Q70 95 52 90" fill="#1a1a1a"/>
        <path d="M112 90 L112 110 Q130 120 148 110 L148 90 Q130 95 112 90" fill="#1a1a1a"/>
        <line x1="88" y1="98" x2="112" y2="98" stroke="#333" stroke-width="3"/>
        <line x1="52" y1="95" x2="35" y2="90" stroke="#333" stroke-width="3"/>
        <line x1="148" y1="95" x2="165" y2="90" stroke="#333" stroke-width="3"/>
        <path d="M55 93 L58 95 L62 93" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
        <path d="M115 93 L118 95 L122 93" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
      `,
      hat: `
        <ellipse cx="100" cy="45" rx="70" ry="15" fill="#4A4A4A"/>
        <path d="M40 45 Q40 10 100 5 Q160 10 160 45" fill="#4A4A4A"/>
        <rect x="35" y="38" width="130" height="10" fill="#333"/>
      `,
      headband: `
        <path d="M35 65 Q100 55 165 65" fill="none" stroke="${this.darkenColor(hairColor, 30)}" stroke-width="8"/>
        <circle cx="100" cy="58" r="8" fill="#EC4899"/>
      `,
      earrings: `
        <circle cx="32" cy="120" r="5" fill="#FFD700"/>
        <circle cx="168" cy="120" r="5" fill="#FFD700"/>
        <circle cx="32" cy="128" r="3" fill="#FFD700"/>
        <circle cx="168" cy="128" r="3" fill="#FFD700"/>
      `
    };

    return accessories[accessory] || '';
  }

  darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) - amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) - amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AvatarCreator;
}
