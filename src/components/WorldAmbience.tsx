"use client";
export default function WorldAmbience() {
  return (
    <div className="world-life" aria-hidden="true">
      <span className="activity-sprite world-benny" />
      <svg className="drifting-cloud cloud-one" viewBox="0 0 210 90">
        <path
          d="M30 75C-2 75 0 35 30 33C25 1 82-8 95 24C122 1 161 14 162 39C207 27 223 77 181 78Z"
          fill="#fff9e7"
          stroke="#f4e5c2"
          strokeWidth="3"
        />
      </svg>
      <svg className="drifting-cloud cloud-two" viewBox="0 0 210 90">
        <path
          d="M30 75C-2 75 0 35 30 33C25 1 82-8 95 24C122 1 161 14 162 39C207 27 223 77 181 78Z"
          fill="#fff9e7"
        />
      </svg>
      <svg className="living-wheel" viewBox="0 0 180 205">
        <path
          d="M35 192L90 85 145 192"
          fill="none"
          stroke="#087f80"
          strokeWidth="13"
          strokeLinejoin="round"
        />
        <g className="living-spokes" transform-origin="90 85">
          <circle
            cx="90"
            cy="85"
            r="69"
            fill="none"
            stroke="#e8ad3c"
            strokeWidth="6"
          />
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d="M90 85L159 85"
              transform={`rotate(${i * 60} 90 85)`}
              stroke="#e8ad3c"
              strokeWidth="4"
            />
          ))}
        </g>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} className={`living-cabin cabin-${i}`}>
            <rect
              x="-16"
              y="-7"
              width="32"
              height="28"
              rx="8"
              fill={["#e97464", "#47a8c5", "#f4c64d"][i % 3]}
              stroke="#163650"
              strokeWidth="3"
            />
            <rect x="-10" y="-2" width="20" height="11" rx="4" fill="#fff8e5" />
          </g>
        ))}
        <circle cx="90" cy="85" r="8" fill="#163650" />
      </svg>
      <div className="living-train">
        <span
          className="activity-sprite"
          style={{ backgroundPosition: "60% 100%" }}
        />
        <span
          className="activity-sprite"
          style={{ backgroundPosition: "80% 100%" }}
        />
        <span
          className="activity-sprite"
          style={{ backgroundPosition: "80% 100%" }}
        />
      </div>
      <svg className="living-tree" viewBox="0 0 150 220">
        <path
          d="M72 212L77 65M76 137L34 92M75 115L120 65"
          stroke="#835436"
          strokeWidth="17"
          fill="none"
          strokeLinecap="round"
        />
        <g className="tree-leaves">
          <path
            d="M20 129C-6 108 9 66 32 66C8 20 65-5 86 26C132-3 163 40 139 69C171 93 145 137 114 124C92 156 52 150 44 124Z"
            fill="#58ad64"
            stroke="#246653"
            strokeWidth="5"
          />
        </g>
      </svg>
      <svg className="living-crane" viewBox="0 0 220 180">
        <path
          d="M85 174V26L160 26M49 174H116"
          fill="none"
          stroke="#e4ad3a"
          strokeWidth="14"
        />
        <g className="crane-hook">
          <path
            d="M160 27V116Q160 141 138 126"
            fill="none"
            stroke="#173c50"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect
            x="123"
            y="130"
            width="55"
            height="35"
            rx="5"
            fill="#c68b58"
            stroke="#835436"
            strokeWidth="3"
          />
        </g>
      </svg>
    </div>
  );
}
