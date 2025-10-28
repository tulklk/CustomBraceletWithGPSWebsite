interface BraceletImageProps {
  theme?: 'bunny-baby-pink' | 'bunny-lavender' | 'bunny-yellow' | 'bunny-mint' | 'bunny-pink' | 'default' | string
  color?: string
  size?: number
}

export function BraceletImage({ 
  theme = 'default', 
  color,
  size = 200 
}: BraceletImageProps) {
  
  // Theme-specific colors and charms
  const themeConfig: Record<string, {
    bandColor: string
    faceColor: string
    rimColor: string
    charms: string[]
  }> = {
    'bunny-baby-pink': {
      bandColor: '#FF69B4',
      faceColor: '#ffffff',
      rimColor: '#FF1493',
      charms: ['🐰', '💕', '🌸', '🎀'],
    },
    'bunny-lavender': {
      bandColor: '#9370DB',
      faceColor: '#ffffff',
      rimColor: '#8A2BE2',
      charms: ['🐰', '⭐', '⚪', '🔵'],
    },
    'bunny-yellow': {
      bandColor: '#FFD700',
      faceColor: '#ffffff',
      rimColor: '#FF8C00',
      charms: ['🐰', '🥕', '🍃', '🌻'],
    },
    'bunny-mint': {
      bandColor: '#98FB98',
      faceColor: '#ffffff',
      rimColor: '#3CB371',
      charms: ['🐰', '🍃', '🌿', '🌸'],
    },
    'bunny-pink': {
      bandColor: '#FFB6C1',
      faceColor: '#ffffff',
      rimColor: '#FF69B4',
      charms: ['🐰', '💕'],
    },
    default: {
      bandColor: color || '#ec4899',
      faceColor: '#ffffff',
      rimColor: '#db2777',
      charms: [],
    },
  }

  const config = themeConfig[theme] || themeConfig.default

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Background circle for aesthetics */}
      <circle cx="200" cy="200" r="190" fill="#f8f9fa" opacity="0.5" />

      {/* Band - horizontal thin strap */}
      <g>
        {/* Shadow */}
        <rect
          x="30"
          y="198"
          width="340"
          height="24"
          rx="12"
          fill="black"
          opacity="0.1"
        />
        
        {/* Main band */}
        <rect
          x="30"
          y="195"
          width="340"
          height="20"
          rx="10"
          fill={config.bandColor}
          stroke={config.rimColor}
          strokeWidth="1"
        />

        {/* Band holes (decorative) */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={40 + i * 22}
            cy={205}
            r="1.5"
            fill="white"
            opacity="0.4"
          />
        ))}
      </g>

      {/* Watch face - center circle */}
      <g>
        {/* Face shadow */}
        <circle cx="200" cy="207" r="42" fill="black" opacity="0.15" />
        
        {/* Face */}
        <circle
          cx="200"
          cy="205"
          r="40"
          fill={config.faceColor}
          stroke={config.rimColor}
          strokeWidth="3"
        />
        
        {/* Inner rim */}
        <circle
          cx="200"
          cy="205"
          r="35"
          fill="transparent"
          stroke={config.rimColor}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Display screen */}
        <rect
          x="185"
          y="195"
          width="30"
          height="12"
          rx="2"
          fill="#1a1a1a"
          opacity="0.15"
        />
      </g>

      {/* Buckle (left) */}
      <g>
        <rect
          x="35"
          y="197"
          width="8"
          height="16"
          rx="1.5"
          fill="#b0b0b0"
          stroke="#888"
          strokeWidth="0.5"
        />
      </g>

      {/* Button (right) */}
      <g>
        <circle cx="360" cy="205" r="8" fill="#cccccc" stroke="#999" strokeWidth="0.5" />
        <circle cx="360" cy="205" r="5" fill="#e0e0e0" />
      </g>

      {/* Charms along the band */}
      {config.charms.map((charm, index) => {
        const positions = [
          { x: 80, y: 170 },
          { x: 120, y: 240 },
          { x: 280, y: 170 },
          { x: 320, y: 240 },
        ]
        const pos = positions[index % positions.length]
        
        return (
          <g key={index}>
            {/* Charm background */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r="16"
              fill="white"
              stroke={config.rimColor}
              strokeWidth="1.5"
              opacity="0.95"
            />
            {/* Emoji charm */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
            >
              {charm}
            </text>
          </g>
        )
      })}

      {/* Theme badge */}
      <g>
        <rect
          x="150"
          y="280"
          width="100"
          height="24"
          rx="12"
          fill={config.rimColor}
          opacity="0.9"
        />
        <text
          x="200"
          y="292"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="white"
          fontWeight="600"
        >
          {theme.toUpperCase()}
        </text>
      </g>
    </svg>
  )
}

