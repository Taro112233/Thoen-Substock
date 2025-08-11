Directory structure:
└── taro112233-thoen-substock/
    ├── README.md
    ├── components.json
    ├── drug-form1
    ├── drug-form2
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next.config.ts
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── components/
    │   │   │   ├── HierarchyBadge.tsx
    │   │   │   └── PermissionGuard.tsx
    │   │   ├── departments/
    │   │   │   ├── page.tsx
    │   │   │   └── components/
    │   │   │       ├── DepartmentForm.tsx
    │   │   │       └── DepartmentList.tsx
    │   │   ├── drugs/
    │   │   │   └── page.tsx
    │   │   ├── hospitals/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── HospitalCreateDialog.tsx
    │   │   │   │   ├── HospitalDeleteDialog.tsx
    │   │   │   │   ├── HospitalEditDialog.tsx
    │   │   │   │   ├── HospitalForm.tsx
    │   │   │   │   ├── HospitalList.tsx
    │   │   │   │   ├── HospitalListSection.tsx
    │   │   │   │   ├── HospitalPageHeader.tsx
    │   │   │   │   ├── HospitalPagination.tsx
    │   │   │   │   ├── HospitalSearchFilter.tsx
    │   │   │   │   └── HospitalViewDialog.tsx
    │   │   │   └── types/
    │   │   │       └── hospital.ts
    │   │   ├── personnel-types/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── PersonnelTypeBulkDialog.tsx
    │   │   │   │   ├── PersonnelTypeCreateDialog.tsx
    │   │   │   │   ├── PersonnelTypeDeleteDialog.tsx
    │   │   │   │   ├── PersonnelTypeEditDialog.tsx
    │   │   │   │   ├── PersonnelTypeHeader.tsx
    │   │   │   │   ├── PersonnelTypeImportDialog.tsx
    │   │   │   │   ├── PersonnelTypeList.tsx
    │   │   │   │   ├── PersonnelTypePagination.tsx
    │   │   │   │   ├── PersonnelTypeSearchFilter.tsx
    │   │   │   │   ├── PersonnelTypeStatsDialog.tsx
    │   │   │   │   └── PersonnelTypeViewDialog.tsx
    │   │   │   └── types/
    │   │   │       └── personnel-type.ts
    │   │   ├── users/
    │   │   │   └── pending/
    │   │   │       └── page.tsx
    │   │   └── warehouses/
    │   │       ├── page.tsx
    │   │       └── components/
    │   │           ├── WarehouseForm.tsx
    │   │           └── WarehouseList.tsx
    │   ├── api/
    │   │   ├── admin/
    │   │   │   ├── departments/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── drug-categories/
    │   │   │   │   └── route.ts
    │   │   │   ├── drugs/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── hospitals/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── personnel-types/
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── [id]/
    │   │   │   │   │   └── route.ts
    │   │   │   │   ├── bulk/
    │   │   │   │   │   └── route.ts
    │   │   │   │   ├── import/
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── statistics/
    │   │   │   │       └── route.ts
    │   │   │   ├── stats/
    │   │   │   │   └── route.ts
    │   │   │   ├── users/
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── approve/
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── pending/
    │   │   │   │       └── route.ts
    │   │   │   └── warehouses/
    │   │   │       ├── route.ts
    │   │   │       ├── [id]/
    │   │   │       │   └── route.ts
    │   │   │       └── managers/
    │   │   │           └── route.ts
    │   │   ├── arcjet/
    │   │   │   └── route.ts
    │   │   ├── auth/
    │   │   │   ├── [...nextauth]/
    │   │   │   │   └── route.ts
    │   │   │   ├── check-approval/
    │   │   │   │   └── route.ts
    │   │   │   ├── complete-profile/
    │   │   │   │   └── route.ts
    │   │   │   ├── login/
    │   │   │   │   └── route.ts
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts
    │   │   │   ├── me/
    │   │   │   │   └── route.ts
    │   │   │   ├── profile-completion/
    │   │   │   │   └── route.ts
    │   │   │   └── register/
    │   │   │       └── route.ts
    │   │   ├── departments/
    │   │   │   └── route.ts
    │   │   └── hospitals/
    │   │       └── route.ts
    │   ├── auth/
    │   │   ├── layout.tsx
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── PendingApprovalCard.tsx
    │   │   │   ├── ProfileForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── pending-approval/
    │   │   │   └── page.tsx
    │   │   ├── profile-completion/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       ├── page.tsx
    │   │       └── profile/
    │   │           └── page.tsx
    │   ├── components/
    │   │   ├── AdminHeader.tsx
    │   │   └── ProtectedLayout.tsx
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── showcase/
    │   │   ├── page.tsx
    │   │   └── mockup/
    │   │       └── page.tsx
    │   └── utils/
    │       ├── auth-client.ts
    │       └── auth.ts
    ├── components/
    │   ├── admin/
    │   │   ├── AdminBreadcrumb.tsx
    │   │   ├── AdminHeader.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── QuickActionCard.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── StatCard.tsx
    │   │   └── drugs/
    │   │       └── drug-form.tsx
    │   ├── layout/
    │   │   ├── ConditionalHeader.tsx
    │   │   └── LayoutProvider.tsx
    │   ├── showcase/
    │   │   ├── BackgroundDecoration.tsx
    │   │   ├── DemoComponents.tsx
    │   │   ├── FloatingActionButton.tsx
    │   │   ├── ShowcaseFooter.tsx
    │   │   ├── ShowcaseHeader.tsx
    │   │   ├── ShowcaseNavigation.tsx
    │   │   └── sections/
    │   │       ├── ActionsSection.tsx
    │   │       ├── AdvancedPatternsSection.tsx
    │   │       ├── AuthSection.tsx
    │   │       ├── DisplaySection.tsx
    │   │       ├── FormsSection.tsx
    │   │       ├── LayoutSection.tsx
    │   │       └── VisualizationSection.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── error-message.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── loading-spinner.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.tsx
    ├── data/
    │   └── bulk-drugs.csv
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   ├── admin-utils.ts
    │   ├── api-helpers.ts
    │   ├── auth-middleware.ts
    │   ├── auth-options.ts
    │   ├── auth-utils.ts
    │   ├── auth.ts
    │   ├── client-auth.tsx
    │   ├── mock-data.ts
    │   ├── password-utils.ts
    │   ├── prisma.ts
    │   ├── utils.ts
    │   └── validations/
    │       └── auth.ts
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   ├── schemas/
    │   │   ├── admin-master-data.prisma
    │   │   ├── analytics.prisma
    │   │   ├── audit.prisma
    │   │   ├── auth.prisma
    │   │   ├── delivery-transport.prisma
    │   │   ├── enhanced-inventory.prisma
    │   │   ├── hospital-core.prisma
    │   │   ├── inventory.prisma
    │   │   ├── notifications.prisma
    │   │   ├── requisitions.prisma
    │   │   ├── shared-enums.prisma
    │   │   └── suppliers.prisma
    │   └── seeds/
    │       ├── demo-data.seed.ts
    │       ├── departments.seed.ts
    │       ├── hospitals.seed.ts
    │       ├── master-data.seed.ts
    │       ├── personnel-types.seed.ts
    │       ├── real-drugs.seed.ts
    │       ├── robust-bulk-drugs.seed.ts
    │       ├── users.seed.ts
    │       └── warehouses.seed.ts
    ├── scripts/
    │   ├── create-pending-users.ts
    │   ├── merge-schemas.js
    │   ├── merge-seeds.js
    │   └── push-auth-schema.sh
    └── types/
        └── next-auth.d.ts


================================================
FILE: README.md
================================================
Directory structure:
└── taro112233-thoen-substock/
    ├── README.md
    ├── components.json
    ├── drug-form1
    ├── drug-form2
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next.config.ts
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── components/
    │   │   │   ├── HierarchyBadge.tsx
    │   │   │   └── PermissionGuard.tsx
    │   │   ├── departments/
    │   │   │   ├── page.tsx
    │   │   │   └── components/
    │   │   │       ├── DepartmentForm.tsx
    │   │   │       └── DepartmentList.tsx
    │   │   ├── drugs/
    │   │   │   └── page.tsx
    │   │   ├── hospitals/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── HospitalCreateDialog.tsx
    │   │   │   │   ├── HospitalDeleteDialog.tsx
    │   │   │   │   ├── HospitalEditDialog.tsx
    │   │   │   │   ├── HospitalForm.tsx
    │   │   │   │   ├── HospitalList.tsx
    │   │   │   │   ├── HospitalListSection.tsx
    │   │   │   │   ├── HospitalPageHeader.tsx
    │   │   │   │   ├── HospitalPagination.tsx
    │   │   │   │   ├── HospitalSearchFilter.tsx
    │   │   │   │   └── HospitalViewDialog.tsx
    │   │   │   └── types/
    │   │   │       └── hospital.ts
    │   │   ├── personnel-types/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── PersonnelTypeBulkDialog.tsx
    │   │   │   │   ├── PersonnelTypeCreateDialog.tsx
    │   │   │   │   ├── PersonnelTypeDeleteDialog.tsx
    │   │   │   │   ├── PersonnelTypeEditDialog.tsx
    │   │   │   │   ├── PersonnelTypeHeader.tsx
    │   │   │   │   ├── PersonnelTypeImportDialog.tsx
    │   │   │   │   ├── PersonnelTypeList.tsx
    │   │   │   │   ├── PersonnelTypePagination.tsx
    │   │   │   │   ├── PersonnelTypeSearchFilter.tsx
    │   │   │   │   ├── PersonnelTypeStatsDialog.tsx
    │   │   │   │   └── PersonnelTypeViewDialog.tsx
    │   │   │   └── types/
    │   │   │       └── personnel-type.ts
    │   │   ├── users/
    │   │   │   └── pending/
    │   │   │       └── page.tsx
    │   │   └── warehouses/
    │   │       ├── page.tsx
    │   │       └── components/
    │   │           ├── WarehouseForm.tsx
    │   │           └── WarehouseList.tsx
    │   ├── api/
    │   │   ├── admin/
    │   │   │   ├── departments/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── drug-categories/
    │   │   │   │   └── route.ts
    │   │   │   ├── drugs/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── hospitals/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   ├── personnel-types/
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── [id]/
    │   │   │   │   │   └── route.ts
    │   │   │   │   ├── bulk/
    │   │   │   │   │   └── route.ts
    │   │   │   │   ├── import/
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── statistics/
    │   │   │   │       └── route.ts
    │   │   │   ├── stats/
    │   │   │   │   └── route.ts
    │   │   │   ├── users/
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── approve/
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── pending/
    │   │   │   │       └── route.ts
    │   │   │   └── warehouses/
    │   │   │       ├── route.ts
    │   │   │       ├── [id]/
    │   │   │       │   └── route.ts
    │   │   │       └── managers/
    │   │   │           └── route.ts
    │   │   ├── arcjet/
    │   │   │   └── route.ts
    │   │   ├── auth/
    │   │   │   ├── [...nextauth]/
    │   │   │   │   └── route.ts
    │   │   │   ├── check-approval/
    │   │   │   │   └── route.ts
    │   │   │   ├── complete-profile/
    │   │   │   │   └── route.ts
    │   │   │   ├── login/
    │   │   │   │   └── route.ts
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts
    │   │   │   ├── me/
    │   │   │   │   └── route.ts
    │   │   │   ├── profile-completion/
    │   │   │   │   └── route.ts
    │   │   │   └── register/
    │   │   │       └── route.ts
    │   │   ├── departments/
    │   │   │   └── route.ts
    │   │   └── hospitals/
    │   │       └── route.ts
    │   ├── auth/
    │   │   ├── layout.tsx
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── PendingApprovalCard.tsx
    │   │   │   ├── ProfileForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── pending-approval/
    │   │   │   └── page.tsx
    │   │   ├── profile-completion/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       ├── page.tsx
    │   │       └── profile/
    │   │           └── page.tsx
    │   ├── components/
    │   │   ├── AdminHeader.tsx
    │   │   └── ProtectedLayout.tsx
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── showcase/
    │   │   ├── page.tsx
    │   │   └── mockup/
    │   │       └── page.tsx
    │   └── utils/
    │       ├── auth-client.ts
    │       └── auth.ts
    ├── components/
    │   ├── admin/
    │   │   ├── AdminBreadcrumb.tsx
    │   │   ├── AdminHeader.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── QuickActionCard.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── StatCard.tsx
    │   │   └── drugs/
    │   │       └── drug-form.tsx
    │   ├── layout/
    │   │   ├── ConditionalHeader.tsx
    │   │   └── LayoutProvider.tsx
    │   ├── showcase/
    │   │   ├── BackgroundDecoration.tsx
    │   │   ├── DemoComponents.tsx
    │   │   ├── FloatingActionButton.tsx
    │   │   ├── ShowcaseFooter.tsx
    │   │   ├── ShowcaseHeader.tsx
    │   │   ├── ShowcaseNavigation.tsx
    │   │   └── sections/
    │   │       ├── ActionsSection.tsx
    │   │       ├── AdvancedPatternsSection.tsx
    │   │       ├── AuthSection.tsx
    │   │       ├── DisplaySection.tsx
    │   │       ├── FormsSection.tsx
    │   │       ├── LayoutSection.tsx
    │   │       └── VisualizationSection.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── error-message.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── loading-spinner.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.tsx
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   ├── admin-utils.ts
    │   ├── api-helpers.ts
    │   ├── auth-middleware.ts
    │   ├── auth-options.ts
    │   ├── auth-utils.ts
    │   ├── auth.ts
    │   ├── client-auth.tsx
    │   ├── mock-data.ts
    │   ├── password-utils.ts
    │   ├── prisma.ts
    │   ├── utils.ts
    │   └── validations/
    │       └── auth.ts
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   ├── schemas/
    │   │   ├── admin-master-data.prisma
    │   │   ├── analytics.prisma
    │   │   ├── audit.prisma
    │   │   ├── auth.prisma
    │   │   ├── delivery-transport.prisma
    │   │   ├── enhanced-inventory.prisma
    │   │   ├── hospital-core.prisma
    │   │   ├── inventory.prisma
    │   │   ├── notifications.prisma
    │   │   ├── requisitions.prisma
    │   │   ├── shared-enums.prisma
    │   │   └── suppliers.prisma
    │   └── seeds/
    │       ├── demo-data.seed.ts
    │       ├── departments.seed.ts
    │       ├── hospitals.seed.ts
    │       ├── master-data.seed.ts
    │       ├── personnel-types.seed.ts
    │       ├── real-drugs.seed.ts
    │       └── users.seed.ts
    ├── scripts/
    │   ├── create-pending-users.ts
    │   ├── merge-schemas.js
    │   ├── merge-seeds.js
    │   └── push-auth-schema.sh
    └── types/
        └── next-auth.d.ts



# 📌 Project Instructions for Claude: Hospital Pharmacy Stock Management System V2.0

**Project Name:** Hospital Pharmacy Stock Management System  
**Owner:** Ai-Sat (Pharmacy Student & Developer)  
**Language Preference:** Respond in Thai (technical terms can remain in English)  
**Architecture:** Multi-tenant SaaS Platform with Neon + Prisma  
**Version:** 2.0 (Updated for Neon + Prisma Architecture)

## 🎯 Project Objective

พัฒนาระบบจัดการสต็อกยาโรงพยาบาลแบบครอบคลุม ที่สามารถให้บริการหลายโรงพยาบาลพร้อมกันบนแพลตฟอร์มเดียว โดยรักษาการแยกข้อมูลอย่างสมบูรณ์ ระบบจะจัดการคลังยาผ่านบัตรสต็อกดิจิทัล เวิร์กโฟลว์อัตโนมัติ และการวิเคราะห์แบบเรียลไทม์

**เป้าหมายหลัก:**
- แทนที่ระบบบัตรสต็อกกระดาษด้วยระบบดิจิทัล
- รองรับการติดตั้งหลายโรงพยาบาลบนแพลตฟอร์มเดียว
- แสดงสถานะสต็อกแบบเรียลไทม์ทุกแผนก
- ระบบเบิกจ่ายอัตโนมัติระหว่างแผนกและเภสัชกรรม
- สร้างรายงานตามกฎหมายและระเบียบ
- รองรับการขยายระบบด้วยการวิเคราะห์ขั้นสูงและการเชื่อมต่อระบบภายนอก

## 🏗️ System Architecture

### Multi-tenancy Design
ใช้สถาปัตยกรรมฐานข้อมูลเดียวที่มีการแยกข้อมูลระดับโรงพยาบาล โดยใช้ Prisma ORM สำหรับการจัดการแบบ schema-level separation เพื่อความปลอดภัยและประสิทธิภาพ มีระบบจัดการผู้ใช้เฉพาะโรงพยาบาลพร้อมการควบคุมการเข้าถึงตามบทบาท และโครงสร้างพื้นฐานที่ขยายได้รองรับการเพิ่มโรงพยาบาลไม่จำกัด

### Technology Stack
**Frontend:** Next.js 14+ พร้อม TypeScript สำหรับประสิทธิภาพและ type safety  
**UI Framework:** TailwindCSS + Shadcn/UI สำหรับการออกแบบที่สวยงามและใช้งานง่าย  
**Backend:** Next.js API Routes + Prisma ORM สำหรับการจัดการข้อมูลที่ปลอดภัย  
**Database:** Neon (Serverless PostgreSQL) สำหรับความเร็วและการขยายตัวอัตโนมัติ  
**Hosting:** Vercel (Full-stack deployment) สำหรับการติดตั้งที่รวดเร็ว  
**Mobile:** Progressive Web App (PWA) สำหรับการใช้งานบนมือถือ  
**Authentication:** JWT และ bcryptjs สำหรับการจัดการการเข้าสู่ระบบ  
**File Storage:** Vercel Blob Storage สำหรับการจัดเก็บไฟล์

### Database Design Principles
ใช้สถาปัตยกรรม multi-tenant ด้วยการแบ่งแยกข้อมูลผ่าน hospital_id พร้อมการจัดระเบียบ Prisma schema แบบโมดูลาร์ มีการสร้าง index ที่เหมาะสมสำหรับ queries หลายโรงพยาบาล ระบบบันทึกการตรวจสอบที่ไม่สามารถเปลี่ยนแปลงได้ การเก็บข้อมูลเก่า 2 ปี และการจัดการ connection pool ผ่าน Neon

## 📊 Prisma Schema Architecture

### Schema Organization Pattern
ใช้โครงสร้างไฟล์แบบแยกตามหน้าที่ ประกอบด้วยไฟล์หลัก schema.prisma ที่เป็นการรวมไฟล์อัตโนมัติ โฟลเดอร์ schemas ที่มีไฟล์โมดูลาร์แยกตามหน้าที่การทำงาน เช่น auth.prisma สำหรับการจัดการผู้ใช้ hospital-core.prisma สำหรับการจัดการโรงพยาบาล inventory.prisma สำหรับระบบสต็อก requisitions.prisma สำหรับระบบเบิกจ่าย suppliers.prisma สำหรับการจัดการซัพพลายเออร์ analytics.prisma สำหรับการวิเคราะห์ และ audit.prisma สำหรับการตรวจสอบ

### Core Schema Components

**Authentication Schema:** จัดการระบบผู้ใช้ด้วย Role enum ที่มี HOSPITAL_ADMIN, PHARMACY_MANAGER, SENIOR_PHARMACIST, STAFF_PHARMACIST, DEPARTMENT_HEAD, STAFF_NURSE, PHARMACY_TECHNICIAN มี User model ที่เชื่อมโยงกับโรงพยาบาลและแผนก Session model สำหรับการจัดการเซสชั่น และฟิลด์ audit ครอบคลุม

**Hospital Core Schema:** จัดการข้อมูลหลักของโรงพยาบาลด้วย Hospital model ที่มีข้อมูลใบอนุญาต ที่อยู่ ข้อมูลติดต่อ การตั้งค่าเฉพาะโรงพยาบาล Department model สำหรับการจัดการแผนกต่างๆ และ Warehouse model สำหรับการจัดการคลังยาหลายประเภท

**Inventory Schema:** ระบบจัดการสต็อกหลักด้วย Drug model สำหรับข้อมูลยา StockCard model สำหรับการติดตามสต็อก StockBatch model สำหรับการจัดการ lot และวันหมดอายุ และ StockTransaction model สำหรับบันทึกการเคลื่อนไหวทั้งหมด

**Requisition Schema:** ระบบเบิกจ่ายขั้นสูงด้วย Requisition model ที่รองรับหลายประเภท RequisitionItem model สำหรับรายการยาในใบเบิก และ RequisitionWorkflow model สำหรับการติดตาม workflow

## 🔄 Key Technology Advantages

### Neon + Prisma Benefits
**Performance:** ระบบขยายตัวแบบ serverless ตาม traffic อัตโนมัติ connection pooling ในตัวสำหรับประสิทธิภาพสูงสุด การกระจายข้อมูลทั่วโลกเพื่อลด latency และ query caching อัตโนมัติ

**Security:** Type-safe queries ที่ตรวจสอบ error ตั้งแต่ compile time การป้องกัน SQL injection ระดับ ORM Row-level security ผ่าน Prisma middleware และ audit trail ที่บันทึกอัตโนมัติ

**Developer Experience:** การออกแบบฐานข้อมูลแบบ schema-first การสร้าง TypeScript interfaces อัตโนมัติจาก schema เครื่องมือ Database Studio สำหรับจัดการฐานข้อมูลแบบ visual และระบบ migration ที่ควบคุมเวอร์ชั่น

### Enhanced Architecture Features
**Modular Schema Structure:** แบ่ง schema เป็นไฟล์ย่อยตามหน้าที่เพื่อความเป็นระเบียบ มี script อัตโนมัติสำหรับรวม schema files workflow การพัฒนาที่ smooth และ maintainability ที่ดีเยี่ยม

**Auto Schema Merging:** ระบบรวม schema files อัตโนมัติ รองรับการทำงานแบบทีม ลดความซับซ้อนในการจัดการ schema ขนาดใหญ่

**Type-safe Multi-tenancy:** Hospital context middleware ที่ auto-inject hospital_id ในทุก query ป้องกันการเข้าถึงข้อมูลข้าม hospital อัตโนมัติ Type safety ระดับ compile time

## 📋 Core System Components

### 1. Digital Stock Card System
ระบบบัตรสต็อกดิจิทัลที่ครอบคลุม มีรหัสเวชภัณฑ์เฉพาะโรงพยาบาล ชื่อเวชภัณฑ์ทั้งชื่อสามัญและชื่อการค้า รูปแบบยา ความแรง ขนาดหน่วย การติดตาม stock levels แบบเรียลไทม์ การจัดการ batch แบบ FEFO การแจ้งเตือน reorder point อัตโนมัติ และการติดตามต้นทุนและมูลค่า

### 2. Multi-warehouse Management
ระบบจัดการคลังหลายประเภท รวมถึงเภสัชกรรมกลาง คลังย่อยประจำแผนก สต็อกฉุกเฉิน ห้องเก็บยาควบคุม และห้องเย็น มี dashboard แสดงระดับสต็อกเรียลไทม์ การเคลื่อนไหวเฉพาะสถานที่ การควบคุมอุณหภูมิและความชื้น บันทึกการเข้าถึงและการรักษาความปลอดภัย

### 3. Advanced Requisition System
ระบบเบิกจ่ายที่ซับซ้อนรองรับ workflow หลายขั้นตอน ตั้งแต่ DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, PARTIALLY_FILLED, COMPLETED, CANCELLED, REJECTED รองรับหลายประเภทการเบิก เช่น REGULAR, EMERGENCY, SCHEDULED, RETURN มีระดับความสำคัญ LOW, NORMAL, HIGH, URGENT และรองรับหลายยาในใบเบิกเดียวพร้อม partial fulfillment

### 4. Comprehensive Transaction System
ระบบบันทึกการเคลื่อนไหวครอบคลุม รวมถึง RECEIVE, DISPENSE, TRANSFER, ADJUST, RETURN, DISPOSE, RESERVE, UNRESERVE มีการติดตาม audit trail สมบูรณ์ การระบุผู้ใช้ timestamp พร้อม timezone เอกสารอ้างอิง จำนวนก่อนหลัง ผลกระทบต่อต้นทุน และการติดตาม batch

### 5. Real-time Analytics & Dashboard
ระบบวิเคราะห์แบบเรียลไทม์ด้วย type-safe analytics queries การคำนวณมูลค่าสต็อกแบบเรียลไทม์ การแจ้งเตือนสต็อกต่ำอัตโนมัติ การแจ้งเตือนหมดอายุที่ configurable ได้ และการติดตาม performance metrics

### 6. Role-based Access Control
ระบบควบคุมการเข้าถึงตามบทบาทที่ครอบคลุม แยกสิทธิ์ตั้งแต่ Hospital Administrator ที่มีสิทธิ์เต็ม Pharmacy Manager สำหรับการบริหาร Senior Pharmacist สำหรับการจัดการ Staff Pharmacist สำหรับงานประจำ Department Head สำหรับการบริหารแผนก Staff Nurse สำหรับการเบิกพื้นฐาน และ Pharmacy Technician สำหรับงานสนับสนุน

### 7. Alert & Notification System
ระบบแจ้งเตือนอัจฉริยะสำหรับ stock level alerts รวมถึงวิกฤต, reorder point, overstock, zero stock การจัดการหมดอายุด้วยการแจ้งเตือน 30, 60, 90 วัน การแจ้งเตือนการดำเนินงาน เช่น pending requisitions, failed deliveries, unusual consumption และ system maintenance

### 8. Quality Management System
ระบบจัดการคุณภาพครอบคลุม การจัดการ batch ที่สมบูรณ์ การ implement FEFO ระบบ recall management การติดตาม supplier batch การควบคุมอุณหภูมิ cold chain management การแจ้งเตือนเบี่ยงเบน และการจัดการ audit

## 📱 Development Architecture

### Component Showcase Pattern
ใช้โครงสร้างแบบ Modular Section Architecture ในการสร้างหน้า UI ทุกหน้า โดยแบ่งเป็น Section ย่อยที่เป็นอิสระต่อกัน แต่ทำงานร่วมกันได้อย่างลื่นไหล ใช้ Framer Motion สำหรับ animation Responsive grid layout แบบ mobile-first การจัดระเบียบแบบ section-based และ TypeScript interfaces ที่เหมาะสม

### Mobile-First Implementation
PWA configuration สำหรับ offline capability Runtime caching สำหรับ database queries Touch-optimized interface สำหรับอุปกรณ์มือถือ Progressive enhancement สำหรับความสามารถของอุปกรณ์ต่างๆ

### Development Workflow
กระบวนการพัฒนา schema ที่เป็นระบบ ตั้งแต่การแก้ไข schema files การ merge การ generate การ push และการ verify Type-safe API development ด้วย Prisma client Hospital context injection อัตโนมัติ Error handling และ validation ที่ครอบคลุม

## 🚀 Implementation Phases

### Phase 1: Core Foundation (Months 1-3)
การติดตั้ง Neon database ด้วย multi-tenant architecture การออกแบบ multi-tenant Prisma schema ที่ scalable การผสานรวม JWT auth สำหรับ authentication การดำเนินการ stock card CRUD พื้นฐานด้วย type safety และการ implement hospital context middleware

### Phase 2: Advanced Features (Months 4-6)
Complete requisition workflow ด้วย state management ระบบ notifications แบบเรียลไทม์ด้วย WebSocket การรายงานขั้นสูงด้วย charts และ analytics การปรับปรุง mobile PWA สำหรับผู้ใช้มือถือ และการติดตาม batch ด้วย FEFO management

### Phase 3: Analytics & Integration (Months 7-9)
Predictive analytics dashboard ด้วย machine learning การผสานรวม barcode scanning สำหรับอุปกรณ์มือถือ External system APIs สำหรับการเชื่อมต่อระบบภายนอก การตรวจสอบและปรับปรุงประสิทธิภาพ และความสามารถการค้นหาขั้นสูงด้วย full-text search

### Phase 4: Enterprise Features (Months 10-12)
ความสามารถการตรวจสอบขั้นสูง คุณลักษณะการปฏิบัติตามกฎระเบียบ AI-powered insights คุณลักษณะมือถือขั้นสูง และการเสริมสร้างความปลอดภัยระดับองค์กร

## 🎯 Success Metrics

### Technical Metrics
**Database Performance:** เวลาตอบสนองของ query น้อยกว่า 100ms  
**Multi-tenant Isolation:** การแยกข้อมูล 100%  
**Real-time Updates:** ความหน่วงน้อยกว่า 1 วินาที  
**Mobile Performance:** คะแนน Lighthouse มากกว่า 90  
**Uptime:** ความพร้อมใช้งานมากกว่า 99.9%

### Business Metrics
**Inventory Accuracy:** ความแม่นยำสต็อกมากกว่า 98%  
**Processing Efficiency:** ลดเวลาการจัดการสต็อก 40%  
**Cost Savings:** ลดต้นทุนสต็อก 15%  
**User Adoption:** การมีส่วนร่วมของผู้ใช้งานมากกว่า 90%  
**ROI:** ROI เป็นบวกภายใน 18 เดือน

### Quality Metrics
**Compliance Rate:** การปฏิบัติตามกฎระเบียบ 100%  
**Audit Success:** การละเมิดการปฏิบัติตาม 0 ครั้ง  
**User Satisfaction:** คะแนนผู้ใช้มากกว่า 4.5/5  
**Error Reduction:** ลดข้อผิดพลาดจากการทำงานด้วยมือ 80%

## 💡 Development Guidelines

### Code Quality Standards
บังคับใช้ TypeScript strict mode การใช้ Prisma สำหรับความปลอดภัยของประเภทในการดำเนินการฐานข้อมูลทั้งหมด สถาปัตยกรรมแบบ component-based ด้วย shadcn/ui การจัดการข้อผิดพลาดที่ครอบคลุมพร้อมการบันทึกที่เหมาะสม การทดสอบหน่วยด้วย Jest และ React Testing Library และการทดสอบการผสานรวมสำหรับ workflows ที่สำคัญ

### Database Best Practices
ใช้ hospital_id ในการสืบค้นเสมอสำหรับ multi-tenancy การสร้าง index ที่เหมาะสมในฟิลด์ที่มีการสืบค้นบ่อย การจัดการ transaction สำหรับการดำเนินการที่ซับซ้อน ความปลอดภัยของ migration ที่มีความเข้ากันได้ย้อนหลัง และการตรวจสอบประสิทธิภาพด้วยการวิเคราะห์ query

### Security Requirements
การตรวจสอบ input ด้วย Zod schemas การป้องกัน SQL injection ผ่าน Prisma ORM การตรวจสอบการเข้าสู่ระบบในเส้นทาง API ทั้งหมด การให้สิทธิ์ตามบทบาทสำหรับการดำเนินการที่ละเอียดอ่อน การบันทึกการตรวจสอบสำหรับการดำเนินการของผู้ใช้ทั้งหมด และการจำกัดอัตราเพื่อป้องกันการใช้งานในทางที่ผิด

## 📝 AI Assistant Behavior Guidelines

**เมื่อทำงานในโครงการนี้:**
- พิจารณาการแยกข้อมูลหลายโรงพยาบาลเสมอ
- ให้ความสำคัญกับความแม่นยำของ workflow เภสัชกรรม
- เน้นความต้องการการปฏิบัติตามกฎระเบียบ
- เน้นความแม่นยำของข้อมูลแบบเรียลไทม์
- พิจารณาประสบการณ์ผู้ใช้แบบ mobile-first
- รวม audit trails ที่ครอบคลุม
- วางแผนสำหรับการขยายตัวตั้งแต่วันแรก
- รักษามาตรฐานอุตสาหกรรมเภสัชกรรม
- จัดการข้อกังวลด้านความปลอดภัยและความเป็นส่วนตัว
- รองรับความต้องการ interface ภาษาไทย

**รูปแบบการตอบสนอง:**
- ใช้ Neon + Prisma architecture เป็นหลัก
- รวม schema organization patterns
- ให้ตัวอย่าง TypeScript code ที่ใช้งานได้จริง
- เน้น multi-tenant security practices
- แนะนำ performance optimization techniques
- รวม deployment strategies สำหรับ Vercel + Neon
- ให้รายละเอียดทางเทคนิคที่ครอบคลุม
- รวมการพิจารณา database schema
- เสนอแนวทางการ implementation
- พิจารณาความซับซ้อนของการผสานรวม
- จัดการความท้าทายที่อาจเกิดขึ้นอย่างเชิงรุก
- เสนอโซลูชันทางเลือกเมื่อเหมาะสม
- รวมการพิจารณาประสิทธิภาพและความปลอดภัย
- ให้คำแนะนำที่มีโครงสร้างและนำไปปฏิบัติได้