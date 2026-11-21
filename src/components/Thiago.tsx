"use client";
/**
 * Tiggy — original, scalable 2D character illustration.
 * Based on the approved design direction: smooth side-swept hair,
 * navy hoodie, yellow builder vest and friendly expressions.
 * This is an SVG game-ready approximation, not the approved raster illustration.
 */
export default function Thiago({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? "thiago small" : "thiago"} viewBox="0 0 320 410" role="img" aria-label="Tiggy, a smiling cartoon boy in a yellow builder vest, waving hello">
      <defs>
        <linearGradient id="tiggy-skin" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#F4B66E"/><stop offset="1" stopColor="#D77C40"/></linearGradient>
        <linearGradient id="tiggy-hair" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#42251C"/><stop offset="1" stopColor="#1F1718"/></linearGradient>
        <linearGradient id="tiggy-vest" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFE95A"/><stop offset="1" stopColor="#FFB500"/></linearGradient>
      </defs>
      <ellipse cx="161" cy="394" rx="100" ry="11" fill="#26465D" opacity=".16"/>
      <g className="tiggy-bounce" stroke="#25243E" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M112 308 L107 369 Q103 382 118 383 L145 383 L149 310Z" fill="#263A75"/>
        <path d="M171 309 L173 373 Q176 385 189 383 L213 382 L214 310Z" fill="#263A75"/>
        <path d="M108 371 Q126 362 147 371 L151 390 Q130 397 101 390 Q96 380 108 371Z" fill="#FFFFFF"/>
        <path d="M176 371 Q193 363 216 372 L223 389 Q197 396 172 390Z" fill="#FFFFFF"/>
        <path d="M103 382 L149 382 M174 383 L220 383" stroke="#80A3D9" strokeWidth="4"/>
        <path d="M106 222 Q74 225 66 282" fill="none" stroke="#1F2C5E" strokeWidth="33"/>
        <path d="M104 220 Q70 231 66 279" fill="none" stroke="#304782" strokeWidth="24"/>
        <circle cx="65" cy="288" r="17" fill="url(#tiggy-skin)"/>
        <g className="tiggy-wave">
          <path d="M222 228 Q256 216 263 164" fill="none" stroke="#1F2C5E" strokeWidth="38"/>
          <path d="M222 228 Q255 216 264 166" fill="none" stroke="#304782" strokeWidth="28"/>
          <path d="M252 159 Q241 144 248 136 Q254 132 260 142 L259 119 Q259 109 266 110 Q273 110 274 122 L278 109 Q285 101 291 109 L291 126 Q302 115 307 123 L304 143 Q315 134 318 145 Q316 163 303 176 Q282 194 260 180Z" fill="url(#tiggy-skin)"/>
        </g>
        <path d="M111 206 Q160 185 213 208 Q239 226 229 318 Q170 339 96 316 Q88 237 111 206Z" fill="#25396F"/>
        <path d="M132 201 Q159 233 189 201" fill="none" stroke="#1A2956" strokeWidth="22"/>
        <path d="M111 212 L145 224 L141 319 L101 313 Q92 254 111 212Z" fill="url(#tiggy-vest)"/>
        <path d="M202 211 L174 225 L178 320 L226 313 Q231 246 202 211Z" fill="url(#tiggy-vest)"/>
        <path d="M101 283 L141 290 L141 302 L99 295 M177 291 L226 283 L228 297 L177 305" fill="#F8F9F9" stroke="#C3C9CF" strokeWidth="2"/>
        <path d="M156 219 L156 324" stroke="#0D1C43" strokeWidth="6"/>
        <rect x="113" y="239" width="74" height="28" rx="12" fill="#FFFFFF"/>
        <text x="150" y="258" fontSize="19" fontWeight="900" textAnchor="middle" fill="#173B8D" stroke="none" fontFamily="Arial,sans-serif">Tiggy</text>
        <circle cx="212" cy="246" r="11" fill="#F9BD23"/>
        <path d="M207 246h10m-5-5v10" stroke="#274576" strokeWidth="3"/>
        <rect x="141" y="182" width="36" height="40" rx="15" fill="url(#tiggy-skin)"/>
        <ellipse cx="81" cy="129" rx="19" ry="26" fill="url(#tiggy-skin)"/>
        <ellipse cx="241" cy="129" rx="19" ry="26" fill="url(#tiggy-skin)"/>
        <path d="M84 112 Q83 38 163 37 Q244 38 240 119 L233 169 Q214 211 162 213 Q107 212 90 172Z" fill="url(#tiggy-skin)"/>
        <path d="M83 127 Q64 84 92 52 Q117 14 176 19 Q230 17 246 63 Q256 93 238 126 L232 89 Q202 92 181 81 Q149 102 93 100Z" fill="url(#tiggy-hair)"/>
        <path d="M90 82 Q120 39 173 44 Q207 42 229 64 Q195 65 176 59 Q138 88 90 82Z" fill="#553328" stroke="none"/>
        <path d="M104 75 Q150 32 203 53" fill="none" stroke="#704335" strokeWidth="7" opacity=".65"/>
        <path d="M110 117 Q128 106 144 116 M181 116 Q198 105 215 117" fill="none" stroke="#59372C" strokeWidth="5"/>
        <g className="tiggy-eyes" stroke="none">
          <ellipse cx="127" cy="140" rx="17" ry="21" fill="#FFFFFF"/>
          <ellipse cx="198" cy="140" rx="17" ry="21" fill="#FFFFFF"/>
          <ellipse cx="130" cy="142" rx="11" ry="15" fill="#281D22"/>
          <ellipse cx="195" cy="142" rx="11" ry="15" fill="#281D22"/>
          <circle cx="134" cy="136" r="4" fill="#FFFFFF"/>
          <circle cx="199" cy="136" r="4" fill="#FFFFFF"/>
        </g>
        <ellipse cx="107" cy="168" rx="18" ry="9" fill="#ED8C6B" opacity=".5" stroke="none"/>
        <ellipse cx="217" cy="168" rx="18" ry="9" fill="#ED8C6B" opacity=".5" stroke="none"/>
        <path d="M155 151 Q160 158 166 151" fill="none" stroke="#B76540" strokeWidth="3"/>
        <path d="M125 174 Q163 210 201 174 Q193 218 163 217 Q135 216 125 174Z" fill="#6D2930"/>
        <path d="M137 179 Q161 193 190 179" fill="none" stroke="#FFFFFF" strokeWidth="9"/>
        <path d="M150 202 Q163 192 179 203" fill="none" stroke="#F28C94" strokeWidth="7"/>
      </g>
    </svg>
  );
}
