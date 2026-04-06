import React from 'react';

const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Defined particles with inline styles for random positioning and delays */}
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-primary/10"
                    style={{
                        width: `${Math.random() * 20 + 5}px`,
                        height: `${Math.random() * 20 + 5}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                />
            ))}

            {/* Floating Leaves (using simple CSS shapes) */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={`leaf-${i}`}
                    className="absolute bg-green-500/20 rounded-tl-full rounded-br-full"
                    style={{
                        width: `${Math.random() * 15 + 10}px`,
                        height: `${Math.random() * 15 + 10}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float ${Math.random() * 15 + 15}s ease-in-out infinite alternate`,
                        animationDelay: `${Math.random() * 5}s`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}

            <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(10deg); }
          66% { transform: translate(-20px, 20px) rotate(-10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
        </div>
    );
};

export default FloatingParticles;
