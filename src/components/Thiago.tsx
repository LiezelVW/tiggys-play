"use client";
// Temporary vector character study, not an approved likeness.
export default function Thiago({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "thiago small" : "thiago"}
      viewBox="0 0 300 390"
      role="img"
      aria-label="Temporary cartoon study of Thiago, a smiling human toddler"
    >
      <ellipse cx="153" cy="369" rx="88" ry="13" fill="#284f4520" />
      <g className="boy-body">
        <rect x="81" y="197" width="135" height="115" rx="39" fill="#568cab" />
        <path d="M110 288v49m76-49v49" stroke="#ae7150" strokeWidth="28" />
        <path
          d="M92 337q20-16 43 0v20H88q-13-6 4-20m75 0q22-16 43 0l8 20h-51z"
          fill="#39708f"
        />
        <path
          d="M98 202q-32 14-38 65"
          fill="none"
          stroke="#b77b56"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <g className="wave-arm">
          <path
            d="M202 206q32 3 40-51"
            fill="none"
            stroke="#b77b56"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <circle cx="244" cy="147" r="16" fill="#b77b56" />
        </g>
        <path
          d="M113 188h68q30 0 36 47l-22 9-5 53h-88l-5-53-23-9q9-47 39-47"
          fill="#fff8e3"
        />
        <path
          d="m146 217 7 17 19 1-15 12 5 18-16-10-16 10 5-18-15-12 19-1z"
          fill="#578eaf"
        />
        <rect x="129" y="168" width="35" height="35" rx="13" fill="#b77b56" />
      </g>
      <g className="boy-head">
        <circle cx="78" cy="120" r="16" fill="#ba7d58" />
        <circle cx="219" cy="120" r="16" fill="#ba7d58" />
        <rect x="81" y="45" width="137" height="142" rx="64" fill="#c58a63" />
        <path
          d="M80 104Q64 37 111 29q66-26 100 22 20 24 6 62l-17-39q-51 8-70-11-10 26-50 41"
          fill="#3d2b25"
        />
        <path
          d="M90 64q33-55 98-17"
          stroke="#3d2b25"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <g className="boy-eyes">
          <ellipse cx="119" cy="115" rx="10" ry="13" fill="#30251f" />
          <ellipse cx="179" cy="115" rx="10" ry="13" fill="#30251f" />
          <circle cx="122" cy="111" r="3" fill="white" />
          <circle cx="182" cy="111" r="3" fill="white" />
        </g>
        <ellipse cx="103" cy="140" rx="13" ry="7" fill="#db9175" />
        <ellipse cx="195" cy="140" rx="13" ry="7" fill="#db9175" />
        <path d="M125 145q25 32 49-1z" fill="#663c2c" />
        <path d="M131 148h36q-16 13-36 0" fill="#fff9e9" />
        <path
          d="M146 126q-7 11 5 10"
          fill="none"
          stroke="#a36745"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
