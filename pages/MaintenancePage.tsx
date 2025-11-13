import React from 'react';

const MaintenancePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[var(--color-background)]">
            <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">🚧 الموقع تحت الصيانة 🚧</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
                نحن نقوم حالياً ببعض التحسينات لجعل تجربتك أفضل. سنعود قريباً!
                <br />
                شكراً لتفهمكم.
            </p>
        </div>
    );
};

export default MaintenancePage;
