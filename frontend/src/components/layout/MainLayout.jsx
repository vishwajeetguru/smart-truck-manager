import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileContainer from './MobileContainer';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <MobileContainer>
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </MobileContainer>
    );
};

export default MainLayout;
