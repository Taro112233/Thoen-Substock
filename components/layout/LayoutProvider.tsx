// components/layout/LayoutProvider.tsx (ไฟล์นี้เป็น optional สำหรับการจัดการที่ซับซ้อนขึ้น)
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  showHeader: boolean;
  setShowHeader: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <LayoutContext.Provider value={{ showHeader, setShowHeader }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// ตัวอย่างการใช้งาน Context pattern (หากต้องการควบคุมการแสดง header แบบ dynamic)
// 
// ใน app/layout.tsx:
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="th">
//       <body>
//         <LayoutProvider>
//           <ConditionalHeaderWithContext />
//           {children}
//         </LayoutProvider>
//       </body>
//     </html>
//   );
// }
//
// ใน ConditionalHeaderWithContext.tsx:
// export function ConditionalHeaderWithContext() {
//   const { showHeader } = useLayout();
//   const pathname = usePathname();
//   
//   const shouldHideHeader = hideHeaderPaths.some(path => 
//     pathname === path || pathname.startsWith(`${path}/`)
//   );
//   
//   if (!showHeader || shouldHideHeader) {
//     return null;
//   }
//   
//   return <AdminHeader />;
// }
//
// ในหน้าอื่นๆ สามารถควบคุม header ได้:
// const { setShowHeader } = useLayout();
// setShowHeader(false); // ซ่อน header
// setShowHeader(true);  // แสดง header