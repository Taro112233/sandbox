# HealthTech Sandbox - Production Instruction

## 🎯 Project Overview

**HealthTech Sandbox** เป็นแพลตฟอร์ม Sandbox สำหรับรับและพัฒนา Technology Requests จากบุคลากรทางการแพทย์  
โดยมีเป้าหมายเพื่อแปลง pain point หน้างาน → sandbox solution แบบ governed และตรวจสอบได้

**หลักการสำคัญ:**
- ไม่ใช้ข้อมูลผู้ป่วยจริง
- ไม่รับประกันการพัฒนา
- เน้น educational และ experimental
- Admin เป็น gatekeeper หลัก

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript
- **UI:** TailwindCSS 4 + Shadcn/UI
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon / Supabase)
- **ORM:** Prisma
- **Authentication:** JWT via jose library
- **Password:** bcryptjs
- **File Storage:** Vercel Blob / Supabase Storage
- **Security:** Arcjet (Selective protection)
- **Date Utilities:** date-fns
- **Form Management:** react-hook-form + zod
- **Toast Notifications:** sonner
- **Hosting:** Vercel

---

## 👥 User Roles & Permissions

### Role System
```typescript
enum UserRole {
  USER = "USER",     // Submit requests + view own requests + comment on own
  ADMIN = "ADMIN"    // Full access + status management + comment anywhere
}
```

### Permission Matrix

| Feature | USER | ADMIN |
|---------|------|-------|
| View landing page | ✅ | ✅ |
| Submit request (requires login) | ✅ | ✅ |
| View own requests | ✅ | ✅ |
| View all requests | ❌ | ✅ |
| Change request status | ❌ | ✅ |
| Comment on own request | ✅ | ✅ |
| Comment on any request | ❌ | ✅ |

---

## 🏷️ Request Status System

### Status Tags (Admin can change anytime - no state machine)
```typescript
enum RequestStatus {
  PENDING_REVIEW = "รอตรวจสอบ",
  UNDER_CONSIDERATION = "อยู่ในการพิจารณา",
  IN_DEVELOPMENT = "อยู่ในการพัฒนา",
  IN_TESTING = "อยู่ในการทดสอบ",
  COMPLETED = "สำเร็จ",
  BEYOND_CAPACITY = "เกินความสามารถ"
}
```

**Status Rules:**
- Default: ทุก request เริ่มต้นที่ `รอตรวจสอบ`
- Admin only: เปลี่ยนสถานะได้ตลอดเวลา
- No auto-transition: manual change only
- Status History: บันทึกทุก transition (fromStatus → toStatus + changedBy + note + timestamp)

---

## 📝 Request Schema

### Request Form Fields
```typescript
interface RequestForm {
  // Required
  painPoint: string              // Pain point หน้างาน (Text area)
  currentWorkflow: string        // ทำงานยังไงตอนนี้ (Text area)
  expectedTechHelp: string       // อยากให้ tech ช่วยอะไร (Text area)
  requestType: RequestType       // Dropdown selection
  
  // Optional
  attachments?: File[]           // รูปภาพ, PDF (max 5 files, 10MB each)
}

enum RequestType {
  CALCULATOR = "CALCULATOR",
  FORM = "FORM",
  WORKFLOW = "WORKFLOW",
  DECISION_AID = "DECISION_AID",
  OTHER = "OTHER"
}
```

---

## 💾 File Upload Architecture

### Storage Strategy

**Recommended:** Vercel Blob (หรือ Supabase Storage)

**Upload Rules:**
- Max file size: 10MB per file
- Max files: 5 files per request
- Allowed types: `image/*`, `application/pdf`
- Security: Server-side validation required

**Data Model:**
```typescript
interface Attachment {
  id: string
  requestId: string
  filename: string
  fileType: string        // MIME type
  fileSize: number        // bytes
  fileUrl: string         // CDN URL
  uploadedAt: DateTime
}
```

**File Validation Principles:**
- ตรวจสอบ file type และ size ที่ server-side
- ห้าม trust client-side validation
- Sanitize filename
- Generate unique storage paths

---

## 🗂️ Database Schema Design

### Schema Organization
```
prisma/
├── schema.prisma           # Main schema (generated from merge)
├── schemas/                # Modular schemas
│   ├── user.prisma        # User & Auth
│   ├── request.prisma     # Request system
│   ├── comment.prisma     # Comment system
│   └── attachment.prisma  # File attachments
└── seed.ts                # Seed data
```

### Core Models (High-level Structure)

**User Model:**
- id, email (unique), password (hashed), name, role
- Relations: requests[], comments[]
- Timestamps: createdAt, updatedAt

**Request Model:**
- id, userId, painPoint, currentWorkflow, expectedTechHelp, requestType, status
- Timestamps: createdAt, updatedAt
- Relations: user, attachments[], comments[], statusHistory[]

**Attachment Model:**
- id, requestId, filename, fileType, fileSize, fileUrl, uploadedAt
- Cascade delete when request deleted

**Comment Model:**
- id, requestId, userId, content
- Timestamps: createdAt, updatedAt
- Relations: request, user
- Cascade delete when request deleted

**StatusHistory Model:**
- id, requestId, fromStatus, toStatus, changedBy (userId), note, changedAt
- Purpose: Track status changes for transparency
- Cascade delete when request deleted

**Indexes:**
- User: email (unique)
- Request: userId, status, createdAt
- Attachment: requestId
- Comment: requestId, userId, createdAt
- StatusHistory: requestId, changedAt

---

## 🔐 Authentication Architecture

### JWT Strategy (Minimal Payload)

**Principle:** Store only user identity in JWT → Check permissions real-time from database

**JWT Payload:**
```typescript
interface JWTPayload {
  userId: string
  email: string
  name: string
  role: UserRole
}
```

**Implementation Libraries:**
- JWT signing/verification: `jose` library
- Password hashing: `bcryptjs`
- Token storage: HTTP-only cookies

**Auth Flow:**
1. User login → Verify password → Sign JWT → Set HTTP-only cookie
2. Middleware reads cookie → Verify JWT → Extract user data
3. API routes check permissions from database (not from JWT)

**Why Minimal JWT?**
- ไม่ต้อง refresh token เมื่อ role เปลี่ยน
- Database เป็น single source of truth
- Security: ลดข้อมูลใน JWT

---

## 🛡️ Middleware Security Architecture

### Protection Layers

**Layer 1: Middleware (Authentication + Route Guard)**
```
middleware.ts responsibilities:
1. Skip static files (/_next, /static, images)
2. Allow public routes (/, /login, /register)
3. Arcjet protection → /api/auth/* endpoints only (rate limiting)
4. JWT validation → redirect /login if invalid
5. Admin route guard → /admin requires ADMIN role
6. Inject user headers (x-user-id, x-user-email, x-user-role) for API routes
```

**Layer 2: API Route Permission Checks**
```
Every API route must:
1. Extract user from headers (injected by middleware)
2. Check permissions from database
3. Validate ownership (USER can only access own requests)
4. Return 401 if not authenticated
5. Return 403 if no permission
```

**Layer 3: UI Permission Checks**
```
Components should:
1. Conditionally render based on user role
2. Hide admin features from USER role
3. Disable actions if no permission
```

**Security Principles:**
- Middleware เป็น first line of defense
- API routes ห้าม trust headers blindly
- Database check for critical operations
- Arcjet only on sensitive endpoints (performance)

---

## 🗺️ Application Routes Structure

### Page Routes (App Router Pattern)
```
app/
├── page.tsx                    # Landing page (public)
├── login/page.tsx              # Login (public)
├── register/page.tsx           # Register (public)
├── dashboard/page.tsx          # My requests (auth required)
├── requests/
│   ├── new/page.tsx           # Submit form (auth required)
│   └── [id]/page.tsx          # Request detail (auth required, ownership check)
└── admin/
    └── page.tsx               # Admin dashboard (admin only)
```

### API Routes Pattern
```
app/api/
├── auth/
│   ├── login/route.ts         # POST - Login
│   ├── register/route.ts      # POST - Register
│   ├── logout/route.ts        # POST - Logout
│   └── me/route.ts            # GET - Current user
├── requests/
│   ├── route.ts               # POST - Create, GET - List (filtered by role)
│   ├── [id]/
│   │   ├── route.ts          # GET - Detail, PATCH - Update
│   │   └── comments/route.ts  # POST - Add comment, GET - List comments
│   └── upload/route.ts        # POST - File upload helper
└── admin/
    └── requests/
        └── [id]/
            └── status/route.ts # PATCH - Change status (admin only)
```

---

## 🔄 User Flow Architecture

### Flow 1: Landing → Login → Dashboard
```
/ (Landing - Public)
  ↓
/login (Public)
  ↓ [After successful login]
/dashboard (Protected)
```

**Landing Page Responsibilities:**
- Explain sandbox concept clearly
- Show completed projects showcase
- Display stats (total requests, completed, in progress)
- CTA buttons → Login / Register

**Dashboard Responsibilities:**
- List user's own requests (USER role)
- List all requests (ADMIN role)
- Show request cards with: title (truncated painPoint), status badge, type, created date
- Link to detail page
- CTA → Submit new request

---

### Flow 2: Submit Request
```
/requests/new (Protected - Auth Required)
  ↓ [Submit form with files]
POST /api/requests
  ↓ [Success]
/requests/[id] (Detail page)
```

**Form Responsibilities:**
- Multi-step or single form (your choice)
- Validate all required fields
- File upload with client-side preview
- Show file validation errors
- Loading state during submission

**API Responsibilities:**
- Validate user authentication
- Validate form data (use zod schema)
- Validate uploaded files (server-side)
- Upload files to storage (Vercel Blob)
- Create request in database
- Create attachment records
- Return created request with ID

---

### Flow 3: View Request Detail
```
/requests/[id] (Protected - Ownership check)
  ↓ [Load data]
GET /api/requests/[id]
```

**Permission Logic:**
```typescript
// User can view if:
// 1. User is ADMIN, OR
// 2. User owns the request (request.userId === currentUser.id)

const hasAccess = 
  currentUser.role === 'ADMIN' || 
  request.userId === currentUser.userId
```

**Page Layout (Two-column):**

**Left Column:**
- Request info (painPoint, currentWorkflow, expectedTechHelp, requestType)
- Status badge
- Attachments (clickable thumbnails/links)
- Comment section (Facebook-style)

**Right Column:**
- Admin actions (if ADMIN) → Status change dropdown
- Status history timeline
- Request metadata (created date, requester name)

---

### Flow 4: Admin Status Change
```
Admin opens /requests/[id]
  ↓
Change status via dropdown
  ↓
PATCH /api/admin/requests/[id]/status
  ↓
Create StatusHistory record
  ↓
Update request status
  ↓
Refresh page / Real-time update
```

**Status Change Data:**
```typescript
{
  status: RequestStatus,      // New status
  note?: string              // Optional note explaining change
}
```

**StatusHistory Record:**
```typescript
{
  requestId: string,
  fromStatus: RequestStatus,  // Previous status
  toStatus: RequestStatus,    // New status
  changedBy: string,          // Admin userId
  note?: string,              // Optional note
  changedAt: DateTime         // Auto timestamp
}
```

---

### Flow 5: Comment System
```
User views /requests/[id]
  ↓
Type comment in textarea
  ↓
POST /api/requests/[id]/comments
  ↓
Permission check (own request OR admin)
  ↓
Create comment in database
  ↓
Return comment with user data
  ↓
Update UI (prepend new comment)
```

**Comment Permission:**
```typescript
// User can comment if:
// 1. User is ADMIN (can comment anywhere), OR
// 2. User owns the request

const canComment = 
  currentUser.role === 'ADMIN' || 
  request.userId === currentUser.userId
```

**Comment Display (Facebook-style):**
- Avatar (user initials)
- User name
- Comment content (whitespace-preserved)
- Relative timestamp (e.g., "2 hours ago")
- Sort: newest first

---

## 🎨 Component Architecture Standards

### Directory Structure Pattern
```
components/
├── ui/                     # Shadcn/UI primitives (button, card, dialog, etc.)
├── shared/                 # Reusable components (Header, Footer, LoadingState)
├── RequestForm/            # Request submission module
│   ├── index.tsx
│   ├── BasicInfoStep.tsx
│   └── FileUploadSection.tsx
├── RequestList/            # Request listing module
│   ├── index.tsx
│   ├── RequestCard.tsx
│   └── RequestFilters.tsx
├── RequestDetail/          # Request detail module
│   ├── index.tsx
│   ├── RequestInfo.tsx
│   ├── StatusBadge.tsx
│   ├── StatusHistory.tsx
│   ├── AttachmentList.tsx
│   └── CommentSection/
│       ├── index.tsx
│       ├── CommentList.tsx
│       ├── CommentItem.tsx
│       └── CommentInput.tsx
└── AdminDashboard/         # Admin dashboard module
    ├── index.tsx
    ├── StatsOverview.tsx
    ├── RequestTable.tsx
    └── StatusFilter.tsx
```

### Component File Header Convention

**ทุกไฟล์ component ต้องมี comment header ระบุ path และชื่อ component**
```typescript
// components/RequestForm/index.tsx
// RequestForm - Main form component

// components/RequestDetail/CommentSection/CommentInput.tsx
// RequestDetail/CommentSection/CommentInput - Comment input form
```

### Component Design Rules

**Size Limits:**
- Max 200 lines per component
- Max 8 props → use composition if more
- Extract complex logic to custom hooks

**Prop Safety:**
```typescript
// ✅ Always provide default values
interface ComponentProps {
  stats?: {
    total?: number;
    pending?: number;
  };
}

export const Component = ({ stats = {} }: ComponentProps) => {
  const safeStats = {
    total: stats.total ?? 0,
    pending: stats.pending ?? 0,
  };
  
  return <div>{safeStats.total}</div>;
}
```

**Composition Over Props:**
```typescript
// ❌ Bad: Too many props
<Table data={data} loading={loading} error={error} onSort={...} onFilter={...} />

// ✅ Good: Composition
<Table>
  <TableHeader />
  <TableBody data={data} />
  <TableFooter />
</Table>
```

**Extract Logic to Hooks:**
```typescript
// ✅ Custom hooks for data fetching
function useRequestData(requestId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch logic
  }, [requestId]);
  
  return { data, loading, error };
}
```

---

## 💬 Comment System Architecture

### UI Pattern (Facebook-style)

**Layout:**
```
┌─────────────────────────────────┐
│ Comment Input (Textarea + Button)│
├─────────────────────────────────┤
│ ┌───┬─────────────────────────┐ │
│ │ A │ John Doe                │ │
│ │   │ Great idea! Let's...    │ │
│ │   │ 2 hours ago             │ │
│ └───┴─────────────────────────┘ │
│ ┌───┬─────────────────────────┐ │
│ │ B │ Jane Smith              │ │
│ │   │ I agree with...         │ │
│ │   │ 5 hours ago             │ │
│ └───┴─────────────────────────┘ │
└─────────────────────────────────┘
```

**Features:**
- Avatar with user initials
- User name display
- Comment content (whitespace preserved)
- Relative timestamp using `date-fns` (Thai locale)
- Auto-scroll to new comment
- Optimistic update (show immediately, then confirm)

**State Management:**
```typescript
// Local state for comment list
const [comments, setComments] = useState(initialComments);

// Add comment optimistically
const handleCommentAdded = (newComment) => {
  setComments(prev => [newComment, ...prev]); // Prepend
};
```

---

## 📊 Admin Dashboard Architecture

### Dashboard Layout

**Top Section: Stats Overview (4 cards)**
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Pending  │ In Dev   │ Completed│
│ Requests │ Review   │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

**Middle Section: Filters**
- Status filter dropdown (All / Specific status)
- Search by keyword (optional - future enhancement)

**Bottom Section: Request Table**

Columns:
- ID (truncated)
- Pain Point (truncated, max 100 chars)
- Type (badge)
- Status (badge)
- Requester (name + email)
- Submitted Date
- Comments Count
- Actions (View Detail button)

**Table Features:**
- Sortable columns
- Status badge color coding
- Pagination (if > 50 requests)
- Click row → Navigate to detail page

---

## 🔌 API Design Principles

### Response Format Standards

**Success Response:**
```typescript
{
  success: true,
  data: { ... },
  meta?: { ... }  // Optional pagination, etc.
}
```

**Error Response:**
```typescript
{
  success: false,
  error: "Error message",
  code?: "ERROR_CODE",
  details?: { ... }
}
```

### HTTP Status Codes

- `200 OK` → Successful GET/PATCH
- `201 Created` → Successful POST
- `400 Bad Request` → Validation error
- `401 Unauthorized` → Missing/invalid auth
- `403 Forbidden` → Valid auth but no permission
- `404 Not Found` → Resource doesn't exist
- `500 Internal Server Error` → Server error

### Authentication Pattern for API Routes
```typescript
// All protected API routes follow this pattern:

export async function GET(request: Request) {
  // 1. Extract user from headers (injected by middleware)
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // 2. Permission check (if needed)
  if (requiresAdmin && userRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  // 3. Business logic
  // ...
}
```

### File Upload API Pattern
```typescript
// POST /api/requests/upload
export async function POST(request: Request) {
  // 1. Auth check
  // 2. Parse FormData
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  
  // 3. Validate files server-side
  for (const file of files) {
    if (file.size > MAX_SIZE) return error;
    if (!ALLOWED_TYPES.includes(file.type)) return error;
  }
  
  // 4. Upload to storage (Vercel Blob)
  const urls = await Promise.all(
    files.map(file => uploadToBlob(file))
  );
  
  // 5. Return URLs
  return NextResponse.json({ urls });
}
```

---

## 🚀 Development Workflow

### Database Scripts (from package.json pattern)

**Schema Management:**
```bash
pnpm schema:merge       # Merge modular schemas
pnpm db:generate        # Generate Prisma client
pnpm db:push           # Push schema to database
pnpm db:migrate        # Create migration (dev)
pnpm db:studio         # Open Prisma Studio
```

**Seed Data:**
```bash
pnpm seeds:merge       # Merge seed files (if modular)
pnpm db:seed           # Run seed
pnpm db:seed:demo      # Seed with demo data
```

**Database Reset:**
```bash
pnpm db:reset          # Reset + seed
pnpm db:reset:demo     # Reset + seed with demo
pnpm db:fresh          # Full reset + demo seed
```

**Development Setup:**
```bash
pnpm db:setup          # Push schema + seed
pnpm db:setup:demo     # Push schema + seed demo
```

### Development Commands
```bash
pnpm dev               # Start dev server (with schema merge)
pnpm build            # Build for production (with schema merge + generate)
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

---

## 📁 Project File Organization

### Root Level Structure
```
project-root/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── requests/
│   ├── admin/
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── shared/           # Shared components
│   └── (feature modules)
├── lib/                   # Utility libraries
│   ├── auth.ts           # JWT utilities (jose)
│   ├── auth-server.ts    # Server auth helpers
│   ├── password.ts       # bcryptjs helpers
│   ├── file-upload.ts    # File upload utilities
│   ├── file-validation.ts # File validation
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # General utilities
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useRequest.ts
│   └── useComments.ts
├── types/                 # TypeScript types
│   ├── auth.d.ts
│   ├── request.ts
│   └── comment.ts
├── prisma/               # Database
│   ├── schema.prisma     # Main schema (generated)
│   ├── schemas/          # Modular schemas
│   └── seed.ts           # Seed file
├── scripts/              # Build scripts
│   ├── merge-schemas.js  # Schema merge utility
│   └── merge-seeds.js    # Seed merge utility
├── middleware.ts         # Next.js middleware
└── package.json          # Dependencies
```

### Lib Directory Purpose

**lib/auth.ts** (JWT utilities):
- signToken() → Create JWT
- verifyToken() → Verify JWT
- Uses `jose` library

**lib/auth-server.ts** (Server helpers):
- getServerUser() → Get user from cookies
- getUserFromHeaders() → Get user from middleware headers
- requireAuth() → Throw if not authenticated
- requireAdmin() → Throw if not admin

**lib/password.ts** (Password utilities):
- hashPassword() → Hash with bcryptjs
- comparePassword() → Verify password

**lib/file-upload.ts** (File storage):
- uploadFile() → Upload single file to Vercel Blob
- uploadMultipleFiles() → Upload array of files
- deleteFile() → Delete file from storage

**lib/file-validation.ts** (File checks):
- validateFile() → Check size, type, extension
- sanitizeFilename() → Clean filename
- Constants: MAX_SIZE, ALLOWED_TYPES

**lib/prisma.ts** (Database client):
- Singleton Prisma client
- Prevents multiple instances in development

---

## ⚠️ Security Best Practices

### Input Validation

**Principle:** Never trust client input

**Implementation:**
- Use `zod` for schema validation
- Validate on both client and server
- Server validation is mandatory
- Sanitize user input (comments, filenames)

### File Upload Security

**Server-side Validation:**
1. Check file size (before upload)
2. Verify file type (MIME type)
3. Validate file extension
4. Check file content (if critical)
5. Generate unique storage path
6. Sanitize filename

**Example Validation Flow:**
```
Client uploads file
  ↓
Server receives FormData
  ↓
Extract file
  ↓
Check size (reject if > 10MB)
  ↓
Check MIME type (reject if not image/pdf)
  ↓
Sanitize filename
  ↓
Upload to Vercel Blob
  ↓
Store URL in database
```

### Authentication Security

**JWT Security:**
- Use HTTP-only cookies (prevent XSS)
- Set secure flag in production
- Set sameSite: 'lax' or 'strict'
- Token expiration: 7 days (configurable)

**Password Security:**
- Hash with bcryptjs (10 rounds minimum)
- Never log passwords
- Never return password in API responses
- Enforce minimum password length (8+ chars recommended)

### API Route Protection

**Every API route checklist:**
1. ✅ Authentication check (except public routes)
2. ✅ Permission check (role-based)
3. ✅ Input validation (zod schema)
4. ✅ Ownership check (for user resources)
5. ✅ Error handling (try-catch)
6. ✅ Proper HTTP status codes

---

## 🎯 Key Implementation Principles

### 1. Simplicity First
- Choose simplest solution that works
- Don't over-engineer
- Start with MVP, iterate later
- Avoid premature optimization

### 2. Security by Default
- Authentication required for all protected routes
- Permission checks on every API call
- Server-side validation mandatory
- Sanitize all user input
- HTTP-only cookies for tokens

### 3. Data Integrity
- Foreign key constraints
- Cascade delete where appropriate
- Indexed columns for performance
- Timestamps on all records
- Status history for transparency

### 4. Developer Experience
- Clear file organization
- Consistent naming conventions
- Component header comments
- Reusable patterns
- Type safety with TypeScript

### 5. User Experience
- Loading states everywhere
- Clear error messages
- Optimistic updates where safe
- Mobile responsive design
- Fast page loads

### 6. Maintainability
- Modular components (<200 lines)
- Custom hooks for shared logic
- Centralized utilities (lib/)
- Consistent API patterns
- Comprehensive error handling

---

## 📦 Dependencies Overview

### Core Framework
- `next` (15.5.9) → App Router, API Routes
- `react` (19.2.1) → UI framework
- `typescript` → Type safety

### Database & ORM
- `@prisma/client` → Database client
- `prisma` (devDep) → Schema management

### Authentication & Security
- `jose` → JWT signing/verification (modern, edge-compatible)
- `bcryptjs` → Password hashing
- `@arcjet/next` → Rate limiting, bot protection

### UI & Styling
- `tailwindcss` (v4) → Utility-first CSS
- Shadcn/UI components (via @radix-ui/*)
- `lucide-react` → Icons
- `class-variance-authority` → Component variants
- `tailwind-merge` → Class merging utility

### Form Management
- `react-hook-form` → Form state management
- `zod` → Schema validation
- `@hookform/resolvers` → Zod + RHF integration

### UI Utilities
- `sonner` → Toast notifications
- `date-fns` → Date formatting/manipulation
- `framer-motion` → Animations (optional)
- `cmdk` → Command palette (optional)

### File Handling
- `papaparse` → CSV parsing (if needed)
- `xlsx` → Excel export (if needed)
- `html2canvas` + `jspdf` → PDF generation (if needed)

### Development Tools
- `tsx` → TypeScript execution
- `ts-node` → TypeScript Node.js runner
- `eslint` → Code linting
- `prettier` → Code formatting (add if needed)

---

## 🚀 Deployment Architecture

### Environment Variables (.env)
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT Secret (generate random string)
JWT_SECRET="your-256-bit-secret-key"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Security (Arcjet)
ARCJET_KEY="your-arcjet-key"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### Vercel Configuration Pattern
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm schema:merge && pnpm db:generate && next build",
  "installCommand": "pnpm install",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "ARCJET_KEY": "@arcjet_key",
    "BLOB_READ_WRITE_TOKEN": "@blob_token"
  }
}
```

### Database Migration Strategy

**Development:**
```bash
pnpm db:migrate          # Create migration
pnpm db:push            # Push schema changes (prototyping)
```

**Production:**
```bash
pnpm db:migrate:prod    # Deploy migrations
# or auto-run via Vercel build command
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Initialize Next.js 15 project
- [ ] Setup Prisma with modular schemas
- [ ] Configure Tailwind CSS v4
- [ ] Install Shadcn/UI components
- [ ] Setup database (Neon/Supabase)
- [ ] Create schema merge script
- [ ] Run initial migration

### Phase 2: Authentication (Week 1-2)
- [ ] Implement JWT utilities (jose)
- [ ] Create auth API routes (login, register, logout, me)
- [ ] Build middleware (auth + route guard)
- [ ] Create login/register pages
- [ ] Test authentication flow
- [ ] Setup Arcjet rate limiting

### Phase 3: Request System (Week 2-3)
- [ ] Create Request schema
- [ ] Build request submission form
- [ ] Implement file upload (Vercel Blob)
- [ ] Create request listing page
- [ ] Build request detail page
- [ ] Test request CRUD operations

### Phase 4: Admin Features (Week 3)
- [ ] Create admin dashboard
- [ ] Implement status change system
- [ ] Build StatusHistory tracking
- [ ] Add admin filters
- [ ] Create stats overview
- [ ] Test admin workflows

### Phase 5: Comment System (Week 3-4)
- [ ] Create Comment schema
- [ ] Build comment components
- [ ] Implement comment API
- [ ] Add real-time updates (optional)
- [ ] Test comment permissions
- [ ] Style comment UI (Facebook-style)

### Phase 6: Polish & Deploy (Week 4)
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to Vercel
- [ ] Production testing
- [ ] Setup monitoring

---

## 🎓 Development Guidelines Summary

### Code Style
- TypeScript strict mode
- Functional components only
- Custom hooks for shared logic
- Consistent file naming (kebab-case for files, PascalCase for components)

### Component Rules
- Max 200 lines per file
- Header comment with file path
- Props interface above component
- Default values for optional props
- Extract complex JSX to sub-components

### API Route Rules
- Consistent response format
- Proper HTTP status codes
- Error handling with try-catch
- Input validation with zod
- Authentication check first
- Permission check second
- Business logic last

### Database Rules
- Use transactions for multi-step operations
- Include timestamps (createdAt, updatedAt)
- Cascade delete where appropriate
- Index frequently queried columns
- Use enums for fixed value sets

### Security Rules
- Never trust client input
- Validate on server always
- Use HTTP-only cookies for tokens
- Hash passwords with bcryptjs
- Sanitize file uploads
- Rate limit sensitive endpoints

---

## 📚 Reference Patterns

### Custom Hook Pattern
```typescript
// hooks/useRequest.ts
export function useRequest(requestId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/requests/${requestId}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequest();
  }, [requestId]);
  
  return { data, loading, error };
}
```

### Server Action Pattern (Optional - for form submissions)
```typescript
// app/actions/request.ts
'use server';

export async function createRequest(formData: FormData) {
  // Validation
  // Database operation
  // Return result
}
```

### Error Boundary Pattern
```typescript
// components/shared/ErrorBoundary.tsx
'use client';

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 🎯 Success Metrics (Not Revenue-Based)

**Quality Metrics:**
- Number of published sandbox cases
- Diversity of solved pain points
- Request completion rate
- Average time to completion

**Engagement Metrics:**
- Number of active requesters
- Comment activity per request
- Repeat request submissions
- User retention rate

**Impact Metrics:**
- External references/citations
- Community contribution growth
- Solved pain point categories
- Knowledge sharing reach

---

## 🔄 Future Enhancements (Post-MVP)

**Phase 2 Features:**
- Request voting system
- Email notifications
- Real-time updates (WebSocket)
- Advanced search and filters
- Request templates
- Duplicate detection
- Export functionality

**Phase 3 Features:**
- Project showcase section
- Public API for integrations
- Analytics dashboard
- Batch operations
- Advanced admin tools
- Collaboration features

---

**End of Instructions**

คำแนะนำนี้ครอบคลุม high-level architecture และ implementation principles  
สำหรับ detailed implementation, ให้ดูที่ existing codebase patterns และ adapt ตามต้องการ

**Remember:** Start simple, iterate based on real usage, maintain security, and focus on user value.