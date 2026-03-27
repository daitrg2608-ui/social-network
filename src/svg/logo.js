function Logo() {
    return (
        <svg width="40" height="40" viewBox="0 0 36 36">
            <defs>
                <linearGradient
                    id="friendnetGradient"
                    x1="50%"
                    x2="50%"
                    y1="100%"
                    y2="0%"
                >
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
            </defs>

            {/* Nền tròn */}
            <circle
                cx="18"
                cy="18"
                r="18"
                fill="url(#friendnetGradient)"
            />

            {/* Chữ FNet */}
            <text
                x="18"
                y="21"
                textAnchor="middle"
                fill="#fff"
                fontSize="10"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
            >
                FNet
            </text>
        </svg>
    );
}

export default Logo;