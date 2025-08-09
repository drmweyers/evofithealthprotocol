# 📋 **FitnessMealPlanner: Complete Role-Based Business Logic Specification**

**Version:** 2.0  
**Last Updated:** August 7, 2025  
**Document Purpose:** Comprehensive specification of all business logic and role interactions

### **Version 2.0 Major Updates (Production Release):**
- ✅ **SECURITY ENHANCEMENTS**: JWT authentication hardened with mandatory 32+ char secrets
- ✅ **HEALTH PROTOCOLS SYSTEM**: Comprehensive client ailments tracking and specialized meal planning
- ✅ **LONGEVITY PROTOCOLS**: Advanced anti-aging meal planning with fasting integration
- ✅ **PARASITE CLEANSE PROTOCOLS**: Specialized detox and anti-parasitic meal plans
- ✅ **PROGRESS TRACKING**: Enhanced body measurements, photo tracking, and goal management
- ✅ **TYPESCRIPT SAFETY**: All compilation errors resolved, full type safety restored
- ✅ **PDF EXPORT SYSTEM**: Both client-side and server-side PDF generation with EvoFit branding
- ✅ **CUSTOMER INVITATIONS**: Enhanced trainer-customer relationship management
- ✅ **MOBILE RESPONSIVE**: Complete mobile optimization for all interfaces
- ✅ **DOCKER DEPLOYMENT**: Production-ready containerization with comprehensive documentation

### **Version 1.2 Changes:**
- ✅ Added comprehensive Profile Image Upload Feature documentation
- ✅ Added profile image management capabilities for all user roles
- ✅ Added AWS S3 and local storage integration specifications
- ✅ Added profile image validation rules and security requirements
- ✅ Added profile avatar display system across all interfaces
- ✅ Updated authentication endpoints to include profile image data

### **Version 1.1 Changes:**
- ✅ Added detailed Meal Plan Assignment Feature documentation
- ✅ Added API endpoints for trainer meal plan assignment
- ✅ Added detailed assignment workflow process
- ✅ Added assignment validation rules and security requirements
- ✅ Updated testing requirements to include assignment modal testing

## 🏗️ **System Architecture Overview**

The system operates on a **three-tier role hierarchy** with strict data isolation and permission boundaries:
- **Admin** → System-wide control and content moderation
- **Trainer** → Client management and meal planning professional
- **Customer** → End-user consuming fitness content and tracking progress

---

## 👨‍💼 **ADMIN ROLE - System Administrator**

### **🎯 Profile Management (Self)**
- ✅ **Profile Updates**: Modify own profile information
- ✅ **Account Settings**: Change password, email preferences
- ✅ **Dashboard Access**: System-wide analytics and statistics
- ✅ **Profile Image Management**: Upload, update, and delete profile picture
  - Supports JPEG, PNG, and WebP formats (up to 5MB)
  - Automatic image processing (resize to 200x200px, optimize quality)
  - AWS S3 storage in production, local storage in development
  - Displays in header navigation and profile pages

### **📊 System Administration Capabilities**

#### **Recipe Management & Content Control**
- ✅ **View All Recipes**: See both approved and unapproved content
- ✅ **Approve/Unapprove Recipes**: Control content visibility system-wide
- ✅ **Bulk Recipe Operations**: 
  - Approve multiple recipes simultaneously
  - Delete multiple recipes at once
  - Import/export recipe collections
- ✅ **AI Recipe Generation**: Generate 1-500 recipes per batch using AI
- ✅ **Recipe Quality Control**: Edit, modify, or delete any recipe

#### **User Management**
- ✅ **View All Users**: Access complete user directory (admins, trainers, customers)
- ✅ **User Analytics**: See user registration trends, activity levels
- ✅ **System Statistics**: 
  - Total users by role
  - Recipe approval rates
  - Meal plan generation statistics
  - System usage metrics

#### **Content Moderation**
- ✅ **Approval Workflow**: Manage recipe approval queue
- ✅ **Content Guidelines**: Enforce recipe quality standards
- ✅ **Bulk Moderation**: Process multiple content items efficiently

#### **Health Protocols & Specialized Nutrition Management**
- ✅ **Health Protocols Templates**: Manage longevity and detox protocol templates
- ✅ **Ailments Database**: Maintain comprehensive database of client health conditions
- ✅ **Anti-Parasitic Ingredients**: Curate specialized ingredient recommendations
- ✅ **Fasting Protocol Integration**: Manage intermittent fasting templates (16:8, 20:4, etc.)
- ✅ **Specialized Recipe Categories**: Organize recipes by therapeutic benefits
- ✅ **Protocol Analytics**: Monitor usage and effectiveness of health protocols

### **🔗 Admin Interactions with Other Roles**

#### **With Trainers:**
- 👁️ **View Only**: Can see all trainer profiles and statistics
- 📊 **Analytics**: Monitor trainer activity and customer management
- 🚫 **No Direct Management**: Cannot modify trainer accounts or assignments

#### **With Customers:**
- 👁️ **View Only**: Can see all customer profiles and progress data
- 📊 **Analytics**: Monitor customer engagement and progress trends
- 🚫 **No Direct Management**: Cannot modify customer data or assignments

---

## 🏋️‍♂️ **TRAINER ROLE - Fitness Professional**

### **🎯 Profile Management (Self)**
- ✅ **Professional Profile**: Name, certifications, specializations
- ✅ **Contact Information**: Phone, email, business details
- ✅ **Statistics Dashboard**: Personal metrics and client overview
- ✅ **Meal Plan Library**: Save and organize custom meal plans
- ✅ **Profile Image Management**: Upload, update, and delete professional profile picture
  - Professional headshot display in client-facing interfaces
  - Same technical specifications as admin (JPEG/PNG/WebP, 5MB limit)
  - Enhanced professional presentation in trainer directory
  - Avatar displays with user initials fallback

### **👥 Customer Management Capabilities**

#### **Customer Invitation System**
- ✅ **Send Invitations**: Email-based secure invitation system
  - Generate 32-byte secure tokens
  - 7-day expiration for security
  - Custom invitation messages
- ✅ **Track Invitations**: View sent/pending/accepted invitations
- ✅ **Invitation Analytics**: See acceptance rates and timing

#### **Customer Relationship Management**
- ✅ **View Assigned Customers**: See all customers who accepted invitations
- ✅ **Customer Progress Overview**: Monitor client fitness progress
- ✅ **Communication History**: Track interactions and assignments

### **🍽️ Meal Planning & Assignment Capabilities**

#### **Meal Plan Creation**
- ✅ **AI-Powered Generation**: Create meal plans with dietary preferences
- ✅ **Custom Meal Plans**: Manual meal plan creation
- ✅ **Meal Plan Library**: Save frequently used meal plans for reuse
- ✅ **Template Management**: Create and manage meal plan templates

#### **🏥 Health Protocols & Specialized Meal Planning**
- ✅ **Client Ailments Assessment**: Track and document client health conditions
  - Comprehensive ailments selection interface
  - Nutritional focus customization based on health needs
  - Priority level assignment (low, medium, high, critical)
  - Integration with meal planning algorithms
- ✅ **Longevity Protocol Planning**: Create anti-aging focused meal plans
  - Intermittent fasting integration (16:8, 20:4, OMAD)
  - Antioxidant-rich ingredient prioritization
  - Cellular health optimization recipes
  - Advanced longevity protocol templates
- ✅ **Parasite Cleanse Protocols**: Specialized detox meal planning
  - Anti-parasitic ingredient recommendations
  - Digestive health optimization
  - Liver support and detox recipes
  - Traditional anti-parasitic foods (garlic, ginger, turmeric, pumpkin seeds)
- ✅ **Targeted Nutrition Planning**: Condition-specific meal recommendations
  - Diabetes-friendly meal plans with blood sugar optimization
  - Heart-healthy protocols with omega-3 emphasis
  - Autoimmune support with anti-inflammatory focus
  - Gut health protocols with probiotic and prebiotic foods

#### **Content Assignment System**
- ✅ **Recipe Assignment**: Assign approved recipes to specific customers
- ✅ **Meal Plan Assignment**: Assign meal plans to customers via modal interface
- ✅ **Personalized Recommendations**: Tailor content to customer needs
- ✅ **Assignment Tracking**: Monitor what content is assigned to whom

#### **Meal Plan Assignment Feature (Detailed)**
- ✅ **Modal-Based Assignment**: Click "Assign to Customer" opens assignment modal
- ✅ **Customer Selection Interface**: Checkbox-based customer selection
- ✅ **Real-Time Customer List**: Fetches trainer's customers via `/api/trainer/customers`
- ✅ **Assignment API Integration**: Uses `POST /api/trainer/meal-plans/:planId/assign`
- ✅ **Success/Error Feedback**: Toast notifications for assignment status
- ✅ **Assignment Validation**: Prevents assignment without customer selection
- ✅ **Assignment Tracking**: Updates meal plan assignment counts
- ✅ **Multiple Assignment Support**: Can assign same plan to multiple customers
- ✅ **Assignment History**: Tracks which customers have which plans assigned

#### **Recipe Access & Management**
- ✅ **Approved Recipe Library**: Access all admin-approved recipes
- ✅ **Recipe Search & Filter**: Find recipes by dietary requirements
- ✅ **Recipe Reviews**: Evaluate recipe quality and suitability
- 🚫 **Cannot Create/Approve**: Must use admin-approved content only

### **🔗 Trainer Interactions with Customers**

#### **Direct Customer Management:**
- ✅ **Invite New Customers**: Send secure email invitations
- ✅ **Assign Meal Plans**: Provide personalized nutrition guidance
- ✅ **Assign Recipes**: Share specific recipes with customers
- ✅ **Monitor Progress**: View customer fitness tracking data
- ✅ **Customer Communication**: Send messages and updates

#### **Content Delivery:**
- ✅ **Personalized Meal Plans**: Create custom plans for each client
- ✅ **Recipe Recommendations**: Suggest recipes based on goals
- ✅ **PDF Generation**: Create printable meal plans for customers
- ✅ **Progress Tracking**: Help customers track fitness goals

### **🚫 Trainer Limitations**
- ❌ **Cannot see other trainers' customers** (complete data isolation)
- ❌ **Cannot approve/create recipes** (admin-only capability)
- ❌ **Cannot modify customer progress data** (customer-only)
- ❌ **Cannot access unapproved recipes** (quality control)

---

## 🧑‍🤝‍🧑 **CUSTOMER ROLE - End User**

### **🎯 Profile Management (Self)**
- ✅ **Personal Profile**: Name, contact information, preferences
- ✅ **Dietary Preferences**: Allergies, dietary restrictions, goals
- ✅ **Account Settings**: Password, notification preferences
- ✅ **Privacy Controls**: Manage data sharing preferences
- ✅ **Profile Image Management**: Upload, update, and delete personal profile picture
  - Personal avatar display in customer interfaces
  - Same technical specifications as other roles (JPEG/PNG/WebP, 5MB limit)
  - Enhanced personalization of fitness journey
  - Integrates with progress tracking and trainer interactions

### **📈 Enhanced Progress Tracking Capabilities**

#### **Comprehensive Body Measurements & Metrics**
- ✅ **Weight Tracking**: Record weight changes over time (kg/lbs with automatic conversion)
- ✅ **Advanced Body Composition**: Track body fat percentage, muscle mass, BMI calculations
- ✅ **Detailed Body Measurements**: Record comprehensive measurements
  - Neck, shoulders, chest, waist, hips circumference
  - Left/right bicep and thigh measurements
  - Left/right calf measurements
  - Flexibility and range of motion tracking
- ✅ **Progress Analytics**: Advanced trend analysis and progress visualization
- ✅ **Measurement History**: Complete historical data with date-based comparisons
- ✅ **Progress Reports**: Generate comprehensive progress reports for trainers

#### **Advanced Progress Photo Management**
- ✅ **Multi-Angle Photo Upload**: Front, side, back, and custom angle photos
- ✅ **Photo Timeline**: Chronological progress visualization with comparison tools
- ✅ **Privacy Controls**: Granular photo visibility settings (private, trainer-only, public)
- ✅ **Secure Cloud Storage**: S3 storage with thumbnail generation
- ✅ **Photo Annotations**: Add captions and notes to progress photos
- ✅ **Comparison Tools**: Side-by-side photo comparisons across time periods

#### **Advanced Goal Setting & Milestone Tracking**
- ✅ **Multi-Category Goals**: Weight loss, weight gain, muscle gain, body fat, performance goals
- ✅ **Smart Milestone System**: Automatic milestone generation with achievement tracking
- ✅ **Goal Progress Calculation**: Automated percentage completion tracking
- ✅ **Achievement Analytics**: Goal completion rates and timeline analysis
- ✅ **Custom Goal Creation**: Flexible goal setting with custom units and targets
- ✅ **Goal Status Management**: Active, achieved, paused, abandoned status tracking

### **🍽️ Meal Plan & Recipe Access**

#### **Assigned Content Viewing**
- ✅ **Personal Meal Plans**: View all trainer-assigned meal plans
- ✅ **Assigned Recipes**: Access trainer-recommended recipes
- ✅ **Meal Plan History**: See all previously assigned meal plans
- ✅ **Recipe Collections**: Organize favorite assigned recipes

#### **Public Content Access**
- ✅ **Approved Recipe Library**: Browse all admin-approved recipes
- ✅ **Recipe Search**: Find recipes by dietary needs, ingredients
- ✅ **Recipe Details**: View full nutritional information and instructions
- ✅ **Recipe Favoriting**: Save favorite recipes for easy access

#### **Enhanced PDF Export & Offline Access System**
- ✅ **Dual PDF Generation System**:
  - **Client-Side PDF**: Instant generation using jsPDF for immediate downloads
  - **Server-Side PDF**: Professional PDF generation using Puppeteer with EvoFit branding
- ✅ **Professional Meal Plan PDFs**: 
  - Custom EvoFit branded templates
  - Comprehensive nutritional summaries
  - Daily meal breakdowns with macro calculations
  - Shopping list integration with ingredient consolidation
- ✅ **Advanced Recipe Collections**: Create themed recipe PDFs with nutritional analysis
- ✅ **Smart Shopping Lists**: 
  - Automatic ingredient consolidation across multiple recipes
  - Quantity calculations based on serving requirements
  - Categorized by grocery store sections (produce, meat, dairy, etc.)
- ✅ **Offline Content Packages**: Download complete meal plans for offline access
- ✅ **Print Optimization**: Professional formatting for kitchen use and meal prep

### **🔗 Customer Interactions (Limited)**

#### **With Trainers:**
- 🔄 **Receive Invitations**: Accept trainer invitations via email
- 📥 **Receive Assignments**: Get meal plans and recipes from trainers
- 👁️ **View Trainer Info**: See basic trainer profile information
- 🚫 **Cannot contact trainers directly** (system boundary)

#### **With System:**
- 📊 **Progress Reporting**: Share progress data with assigned trainers
- 💬 **System Feedback**: Provide feedback on recipes and meal plans
- 🔔 **Notifications**: Receive updates about new assignments

### **🚫 Customer Limitations**
- ❌ **Cannot see other customers' data** (complete privacy isolation)
- ❌ **Cannot create or approve recipes** (content control)
- ❌ **Cannot invite others** (trainer-only capability)
- ❌ **Cannot access unapproved recipes** (quality control)

---

## 🖼️ **Profile Image Upload System - Universal Feature**

### **📁 Technical Architecture**

#### **Storage Systems**
- ✅ **AWS S3 Integration**: Production environment with secure cloud storage
  - Bucket: `fitnessmealplanner-uploads` (configurable via environment)
  - Region: `us-east-1` (configurable via AWS_REGION)
  - Access Control: Public-read for profile images
  - Cache Control: 1-year cache for optimized performance
- ✅ **Local Storage Fallback**: Development environment support
  - Path: `/uploads/profile-images/`
  - Automatic directory creation and management
  - File naming: `userId-uniqueId.jpg` format

#### **Image Processing Pipeline**
- ✅ **Sharp.js Integration**: High-performance image processing
  - Automatic resize to 200x200 pixels (square format)
  - Crop mode: Cover with center positioning
  - Format standardization: All images converted to JPEG
  - Quality optimization: 85% JPEG quality for size/quality balance
- ✅ **File Validation System**:
  - Supported formats: JPEG, PNG, WebP
  - Maximum file size: 5MB
  - MIME type validation with case-insensitive support
  - Comprehensive error handling and user feedback

#### **Security & Validation**
- ✅ **Authentication Required**: All profile image operations require valid JWT
- ✅ **File Type Validation**: Strict MIME type checking prevents malicious uploads
- ✅ **Size Limitations**: 5MB limit prevents system abuse and storage bloat
- ✅ **Unique File Naming**: Prevents conflicts and ensures data integrity
- ✅ **Automatic Cleanup**: Old profile images deleted when new ones uploaded

### **🎨 User Interface Components**

#### **ProfileImageUpload Component**
- ✅ **Interactive Upload Interface**:
  - Drag-and-drop file selection
  - Click-to-upload functionality
  - Real-time preview of selected images
  - Loading states with progress indicators
- ✅ **Avatar Display System**:
  - Multiple size variants: sm (48px), md (64px), lg (96px), xl (128px)
  - Automatic user initials generation from email addresses
  - Graceful fallback when no image is available
  - Consistent styling across all application interfaces
- ✅ **User Experience Features**:
  - Hover effects and visual feedback
  - Toast notifications for success/error states
  - Optimistic UI updates for immediate feedback
  - Accessible design with proper ARIA labels

#### **ProfileAvatar Component**
- ✅ **Display-Only Avatar**: Lightweight component for header and listing views
- ✅ **Responsive Design**: Adapts to different screen sizes and contexts
- ✅ **Integration Points**: Used in header navigation, profile pages, user listings

### **🔗 System Integration**

#### **Authentication Integration**
- ✅ **JWT Token Updates**: Profile image URLs included in authentication responses
- ✅ **Session Persistence**: Profile images persist across user sessions
- ✅ **Auto-Refresh**: Authentication context automatically updates with new images

#### **Database Integration**
- ✅ **User Schema Extension**: `profilePicture` field added to users table
- ✅ **Nullable Design**: Profile images are optional, not required
- ✅ **Migration Support**: Backward-compatible database schema updates

#### **API Integration**
- ✅ **React Query Integration**: Optimistic updates and cache invalidation
- ✅ **FormData Support**: Proper multipart/form-data handling in API client
- ✅ **Error Handling**: Comprehensive error responses and user feedback

### **📱 Cross-Platform Display**

#### **Header Navigation**
- ✅ **Universal Display**: Profile images appear in header across all roles
- ✅ **Consistent Sizing**: Small avatar format (sm) for header integration
- ✅ **Fallback Handling**: User initials display when no image available

#### **Profile Pages**
- ✅ **Large Format Display**: Extra-large avatars (xl) for profile pages
- ✅ **Upload Interface**: Full upload/delete functionality on profile pages
- ✅ **Role-Specific Styling**: Appropriate presentation for each user role

#### **User Listings & Cards**
- ✅ **Medium Format**: Balanced size for user directory and listing views
- ✅ **Performance Optimized**: Efficient loading and caching strategies

---

## 🔄 **Inter-Role Workflow Processes**

### **1. Customer Onboarding Flow**
```
Trainer → Send Invitation → Customer Email → Registration → Auto-Link → Access Granted
```

### **2. Meal Plan Assignment Flow**
```
Trainer → Generate/Save Plan → Saved Plans Tab → Click "Assign to Customer" → 
Assignment Modal Opens → Select Customer(s) → Click "Assign" → 
API Call (/api/trainer/meal-plans/:planId/assign) → Success Notification → 
Customer Access Granted
```

#### **Detailed Assignment Process:**
1. **Plan Selection**: Trainer navigates to Saved Plans in meal plan library
2. **Assignment Trigger**: Click three-dot menu → "Assign to Customer"
3. **Modal Interface**: Assignment modal displays with customer list
4. **Customer Selection**: Checkbox interface for selecting customers
5. **Validation**: System prevents assignment without customer selection
6. **API Processing**: Assignment data sent to backend for processing
7. **Confirmation**: Success/error feedback via toast notifications
8. **State Update**: UI refreshes to show updated assignment counts

### **3. Recipe Approval Flow**
```
Admin → Generate/Import Recipe → Review → Approve → Trainer Access → Customer Assignment
```

### **4. Progress Tracking Flow**
```
Customer → Record Progress → Data Storage → Trainer Dashboard → Progress Analysis
```

### **5. Profile Image Upload Flow**
```
User → Select Image → Client Validation → Upload API → Image Processing → 
S3/Local Storage → Database Update → UI Refresh → Header Avatar Update
```

#### **Detailed Profile Image Process:**
1. **Image Selection**: User clicks upload button or drags file to upload area
2. **Client Validation**: JavaScript validates file type (JPEG/PNG/WebP) and size (≤5MB)
3. **Upload Initiation**: FormData sent to `/api/profile/upload-image` endpoint
4. **Server Processing**: Multer receives file, Sharp processes and resizes
5. **Storage Decision**: Production uses S3, development uses local storage
6. **Database Update**: User's profilePicture field updated with new URL
7. **Response Handling**: Success response triggers UI updates
8. **Cache Invalidation**: React Query invalidates user and profile caches
9. **UI Refresh**: Avatar updates in header, profile page, and all user displays

---

## 🔒 **Enhanced Security & Permission Boundaries**

### **Hardened Authentication System**
- 🔐 **JWT Tokens**: 15-minute access, 7-day refresh with HS256 algorithm
- 🔑 **Mandatory Strong Secrets**: JWT secrets must be 32+ characters (enforced at startup)
- 🔄 **Secure Token Refresh**: Separate JWT_REFRESH_SECRET for enhanced security
- 🛡️ **Rate Limiting**: 5 failed attempts = 15-minute lockout with IP tracking
- 💪 **Strong Password Policy**: 8+ chars, mixed case, numbers, special characters
- 🚨 **Security Validation**: Application fails to start with weak JWT secrets
- 🔒 **CORS Hardening**: Production CORS configuration with origin validation
- 🛡️ **XSS Protection**: Input sanitization and output encoding
- 📝 **Security Documentation**: Comprehensive SECURITY.md with incident response procedures

### **Data Isolation Rules**
- **Admin**: See everything, control everything
- **Trainer**: Own customers only, approved recipes only
- **Customer**: Own data only, assigned content only

### **Privacy Controls**
- 📸 **Progress Photos**: Private by default, customer-controlled
- 📊 **Progress Data**: Isolated per customer, trainer visibility optional
- 💌 **Communications**: Secure invitation system only

---

## 🔌 **API Endpoints**

### **Health Protocols & Specialized Planning Endpoints**
```
GET /api/health/longevity-templates
- Purpose: Retrieve available longevity protocol templates
- Response: { templates: LongevityProtocol[], total: number }
- Security: Requires trainer or admin authentication

GET /api/health/anti-parasitic-ingredients
- Purpose: Get curated list of anti-parasitic ingredients
- Response: { ingredients: AntiParasiticIngredient[], categories: string[] }
- Security: Requires trainer or admin authentication

GET /api/health/user-preferences/:userId
- Purpose: Retrieve user's health preferences and protocol settings
- Response: { preferences: HealthPreferences }
- Security: Requires authentication and user ownership or trainer relationship

PUT /api/health/user-preferences/:userId
- Purpose: Update user's health preferences and ailments
- Body: { longevityGoals: string[], fastingProtocol: string, ailments: ClientAilments }
- Response: { preferences: HealthPreferences, message: string }
- Security: Requires authentication and user ownership or trainer relationship

POST /api/health/log-symptoms/:userId
- Purpose: Log protocol symptoms and progress for tracking
- Body: { symptoms: string[], severity: number, notes: string }
- Response: { logEntry: SymptomLog, message: string }
- Security: Requires user authentication
```

### **Enhanced Progress Tracking Endpoints**
```
POST /api/progress/measurements
- Purpose: Record comprehensive body measurements
- Body: { measurementDate: string, weightKg?: number, weightLbs?: number, bodyMeasurements: BodyMeasurements }
- Response: { measurement: ProgressMeasurement, message: string }
- Security: Requires customer authentication

GET /api/progress/measurements
- Purpose: Retrieve measurement history with trend analysis
- Query: { startDate?: string, endDate?: string, limit?: number }
- Response: { measurements: ProgressMeasurement[], trends: TrendAnalysis }
- Security: Requires customer authentication

POST /api/progress/photos
- Purpose: Upload progress photos with metadata
- Content-Type: multipart/form-data
- Body: FormData with photo file and metadata
- Response: { photo: ProgressPhoto, uploadUrl: string }
- Security: Requires customer authentication

POST /api/progress/goals
- Purpose: Create new fitness goal with milestone tracking
- Body: { goalType: string, goalName: string, targetValue: number, targetDate: string }
- Response: { goal: CustomerGoal, milestones: GoalMilestone[] }
- Security: Requires customer authentication

PUT /api/progress/goals/:goalId
- Purpose: Update goal progress and status
- Body: { currentValue?: number, status?: string, notes?: string }
- Response: { goal: CustomerGoal, progressPercentage: number }
- Security: Requires customer authentication and goal ownership
```

### **Enhanced PDF Export Endpoints**
```
POST /api/pdf/export/meal-plan
- Purpose: Generate professional PDF from meal plan data
- Body: { mealPlan: MealPlan, includeShoppingList: boolean, brandingOptions: BrandingOptions }
- Response: PDF file with custom EvoFit branding
- Security: Requires authentication

POST /api/pdf/export/progress-report
- Purpose: Generate comprehensive progress report PDF
- Body: { customerId: string, dateRange: DateRange, includePhotos: boolean }
- Response: PDF file with progress analysis and visualizations
- Security: Requires customer or trainer authentication with appropriate access

POST /api/pdf/export/recipe-collection
- Purpose: Create themed recipe collection PDFs
- Body: { recipeIds: string[], collectionName: string, theme: string }
- Response: PDF file with recipe collection and nutritional summary
- Security: Requires authentication

GET /api/pdf/templates
- Purpose: Get available PDF templates and branding options
- Response: { templates: PDFTemplate[], brandingOptions: BrandingOption[] }
- Security: Requires authentication
```

### **Profile Image Management Endpoints**
```
POST /api/profile/upload-image
- Purpose: Upload and process a new profile image for authenticated user
- Content-Type: multipart/form-data
- Body: FormData with 'profileImage' file field
- Response: { status: 'success', data: { profileImageUrl: string, user: User } }
- Processing: Validates file type/size, resizes to 200x200px, stores in S3/local
- Security: Requires authentication (any role)
- Validation: JPEG/PNG/WebP, max 5MB, automatic format conversion to JPEG

DELETE /api/profile/delete-image
- Purpose: Remove current profile image for authenticated user
- Response: { status: 'success', data: { user: User } }
- Processing: Deletes file from S3/local storage, sets profilePicture to null
- Security: Requires authentication (any role)
- Cleanup: Automatically removes old image files

GET /api/profile
- Purpose: Fetch complete profile data including profile image URL
- Response: { status: 'success', data: User }
- Includes: profilePicture field with full image URL or null
- Security: Requires authentication (any role)
```

### **Updated Authentication Endpoints**
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
- Enhanced Response: All authentication endpoints now include profilePicture field
- Format: { user: { id, email, role, profilePicture: string | null } }
- Integration: Profile images automatically available in auth context
```

### **Trainer Assignment Endpoints**
```
GET /api/trainer/customers
- Purpose: Fetch all customers assigned to the authenticated trainer
- Response: { customers: Customer[], total: number }
- Security: Requires trainer authentication

POST /api/trainer/meal-plans/:planId/assign
- Purpose: Assign a saved meal plan to a specific customer
- Body: { customerId: string, notes?: string }
- Response: { assignment: Assignment, message: string }
- Security: Requires trainer authentication and plan ownership

DELETE /api/trainer/meal-plans/:planId/assign/:customerId
- Purpose: Remove meal plan assignment from customer
- Response: { message: string }
- Security: Requires trainer authentication and plan ownership

GET /api/trainer/meal-plans
- Purpose: Fetch all saved meal plans for the trainer
- Response: { mealPlans: TrainerMealPlan[], total: number }
- Security: Requires trainer authentication
```

### **Assignment Validation Rules**
- ✅ **Plan Ownership**: Trainer must own the meal plan being assigned
- ✅ **Customer Validation**: Customer must exist and be accessible to trainer
- ✅ **Duplicate Prevention**: System allows multiple assignments of same plan
- ✅ **Assignment Tracking**: Each assignment creates audit trail
- ✅ **Cascade Operations**: Plan deletion removes all assignments

---

## 📊 **Enhanced Business Rules Summary**

### **Core System Rules**
1. **Content Approval Gate**: Only approved recipes visible to trainers/customers
2. **Invitation-Based Relationships**: Customers must be invited by trainers
3. **Data Ownership**: Customers own their progress data exclusively
4. **Recipe Assignment**: Only trainers can assign specific content to customers
5. **Library System**: Trainers can save and reuse meal plan templates
6. **Progress Privacy**: Customer progress data is private by default
7. **Role Hierarchy**: Admin > Trainer > Customer in system permissions

### **Security & Authentication Rules**
8. **JWT Secret Enforcement**: Application fails to start with JWT secrets < 32 characters
9. **Token Security**: Separate access and refresh tokens with different expiration times
10. **Authentication Hardening**: HS256 algorithm mandatory, no weak encryption allowed
11. **Password Policy**: Minimum 8 characters with mixed case, numbers, special characters
12. **Rate Limiting**: Failed login attempts trigger IP-based temporary lockouts

### **Health Protocols & Specialized Planning Rules**
13. **Ailments Privacy**: Client health information only accessible to assigned trainer
14. **Protocol Authorization**: Only trainers can assign health protocols to customers
15. **Longevity Protocol Validation**: Fasting protocols must be age and health appropriate
16. **Anti-Parasitic Safety**: Specialized protocols require health screening documentation
17. **Progress Monitoring**: Health protocol symptoms must be logged and monitored

### **Progress Tracking Rules**
18. **Measurement Accuracy**: Body measurements require date validation and reasonable ranges
19. **Photo Privacy**: Progress photos private by default with granular visibility controls
20. **Goal Validation**: Fitness goals must have realistic timelines and achievable targets
21. **Milestone Logic**: Automatic milestone generation based on goal type and timeline

### **Profile & Media Management Rules**
22. **Profile Image Security**: All image uploads require authentication and validation
23. **Universal Avatar System**: All user roles have access to profile image functionality
24. **Image Processing Standard**: All uploaded images standardized to 200x200 JPEG format
25. **Storage Environment Logic**: S3 for production, local storage for development
26. **File Cleanup Protocol**: Old profile images automatically deleted when new ones uploaded

### **PDF Export & Document Generation Rules**
27. **Brand Consistency**: All PDFs must use approved EvoFit branding templates
28. **Data Accuracy**: PDF content must match live application data exactly
29. **Export Authorization**: Users can only export their own data or assigned content
30. **Professional Formatting**: Server-side PDFs for professional use, client-side for quick access

---

## 🧪 **Comprehensive Testing Requirements**

### **Critical Test Scenarios**

#### **Core System Testing**
1. **Role Authentication**: Each role can only access their permitted areas
2. **Data Isolation**: Users cannot access data outside their permission scope
3. **Workflow Processes**: All inter-role workflows function correctly
4. **Security Boundaries**: Permission violations are properly blocked
5. **Content Approval**: Recipe approval workflow functions correctly
6. **Invitation System**: Customer invitation and registration process
7. **Assignment System**: Meal plan and recipe assignment workflows

#### **Enhanced Security Testing**
8. **JWT Secret Validation**: Application startup fails with weak secrets (<32 chars)
9. **Token Security**: Access and refresh token lifecycle management
10. **Authentication Hardening**: HS256 algorithm enforcement and token validation
11. **Rate Limiting**: Failed login attempt lockout mechanisms
12. **CORS Security**: Cross-origin request validation and protection
13. **XSS Protection**: Input sanitization and output encoding validation

#### **Health Protocols & Specialized Planning Testing**
14. **Ailments System**: Client health condition tracking and privacy
15. **Longevity Protocols**: Anti-aging meal planning and fasting integration
16. **Parasite Cleanse**: Anti-parasitic ingredient recommendations and safety
17. **Protocol Assignment**: Trainer-to-customer health protocol assignment
18. **Health Privacy**: Medical information access control and data isolation
19. **Symptom Logging**: Health protocol progress tracking and monitoring

#### **Enhanced Progress Tracking Testing**
20. **Comprehensive Measurements**: Advanced body measurement tracking system
21. **Progress Photo Management**: Multi-angle photo upload and privacy controls
22. **Goal Setting System**: Advanced goal creation and milestone tracking
23. **Achievement Analytics**: Goal completion rates and progress calculations
24. **Measurement Validation**: Data range validation and accuracy checks
25. **Progress Reports**: PDF generation for customer and trainer reporting

#### **PDF Export System Testing**
26. **Dual PDF Generation**: Both client-side (jsPDF) and server-side (Puppeteer) systems
27. **EvoFit Branding**: Professional PDF templates and brand consistency
28. **Meal Plan PDFs**: Complete meal plan formatting with nutritional data
29. **Shopping List Generation**: Ingredient consolidation and grocery categorization
30. **Progress Report PDFs**: Comprehensive progress analysis with visualizations

#### **Profile & Media Management Testing**
31. **Profile Image Upload System**: Complete image upload and management workflow
32. **Image Validation**: File type, size, and security validation testing
33. **Image Processing**: Sharp.js resize and format conversion functionality
34. **Storage Integration**: Both S3 and local storage systems
35. **Avatar Display**: Profile images display correctly across all interfaces
36. **Authentication Integration**: Profile images included in auth responses

#### **Mobile & Responsive Design Testing**
37. **Mobile Optimization**: Complete mobile interface functionality
38. **Responsive Layout**: All components adapt to different screen sizes
39. **Touch Interface**: Mobile-specific interactions and gestures
40. **Performance**: Mobile load times and resource optimization

### **Test Data Requirements**

#### **User Accounts**
- **Admin account** with full permissions and profile image
- **Trainer account** with assigned customers and professional headshot
- **Customer account** with assigned content and personal avatar
- **Test customer accounts** with various health conditions and goals

#### **Content Data**
- Approved and unapproved recipes for testing content gates
- Health protocol templates (longevity, anti-parasitic)
- Meal plan templates with various dietary restrictions
- Recipe collections for PDF export testing

#### **Health & Progress Data**
- Comprehensive body measurements over time
- Progress photos (front, side, back angles)
- Multiple fitness goals with milestones
- Health ailments and protocol assignments
- Symptom logs and protocol progress data

#### **Media Testing Files**
- **Valid image files**: JPEG, PNG, WebP (various sizes under 5MB)
- **Invalid files**: PDF, TXT, oversized images (>5MB)
- **Profile image scenarios**: All user roles with different image formats
- **Progress photos**: Multiple angles and quality levels

#### **PDF Testing Data**
- Complete meal plans with multiple days and meals
- Recipe collections with nutritional summaries
- Progress tracking data for report generation
- Shopping lists with ingredient consolidation requirements

#### **Security Testing Scenarios**
- **Weak JWT secrets**: Strings under 32 characters
- **Invalid authentication**: Expired tokens, malformed headers
- **Permission violations**: Cross-role data access attempts
- **Rate limiting**: Multiple failed login attempts from same IP
- **File upload attacks**: Malicious file types, oversized uploads

---

## 🏗️ **Technical Architecture & Deployment**

### **Production Deployment Features**
- ✅ **Docker Containerization**: Complete Docker setup with multi-stage builds
- ✅ **Database Migrations**: Automated Drizzle ORM migrations on deployment
- ✅ **Environment Configuration**: Comprehensive environment variable management
- ✅ **SSL Certificate Management**: Automated certificate handling
- ✅ **Production Optimizations**: Minified assets, image optimization, CDN integration

### **Development Environment**
- ✅ **Hot Reload**: Real-time development with Vite hot module replacement
- ✅ **TypeScript Integration**: Complete type safety throughout the application
- ✅ **Database Development**: Local PostgreSQL setup with seed data
- ✅ **Testing Environment**: Jest, Playwright, and Vitest integration
- ✅ **Development Tools**: ESLint, Prettier, and automated formatting

### **Mobile-First Design Philosophy**
- ✅ **Responsive Layout**: Mobile-first CSS with Tailwind responsive utilities
- ✅ **Touch Optimization**: Touch-friendly button sizes and gesture support
- ✅ **Performance**: Optimized for mobile network conditions and device capabilities
- ✅ **Progressive Enhancement**: Graceful degradation for older browsers
- ✅ **Accessibility**: WCAG 2.1 AA compliance for mobile accessibility

## 🧬 **Specialized Health Protocol Components**

### **Client Ailments Interface Components**
```typescript
// MinimalSpecializedPanel.tsx - Streamlined ailments selection
- Purpose: Simplified client ailments input for meal plan generation
- Features: Checkbox-based ailment selection with priority levels
- Integration: Direct integration with meal plan generation workflow
- Security: Validates health information privacy and trainer access

// TestSpecializedPanel.tsx - Development testing interface
- Purpose: Comprehensive testing of health protocol features
- Features: Full ailments system testing with mock data
- Integration: Development environment testing and debugging
- Usage: Component testing and health protocol validation
```

### **Health Protocol API Integration**
- ✅ **Ailments Tracking**: Comprehensive client health condition management
- ✅ **Protocol Templates**: Pre-built health protocol configurations
- ✅ **Ingredient Recommendations**: Therapeutic ingredient suggestions
- ✅ **Progress Monitoring**: Health protocol effectiveness tracking
- ✅ **Safety Validation**: Health screening and contraindication checks

### **Longevity & Anti-Aging Features**
- ✅ **Fasting Integration**: Intermittent fasting protocol management
- ✅ **Antioxidant Optimization**: Meal plans optimized for cellular health
- ✅ **Nutrient Timing**: Strategic nutrient delivery for longevity benefits
- ✅ **Biomarker Tracking**: Health metrics monitoring and analysis

### **Parasite Cleanse & Detox Protocols**
- ✅ **Anti-Parasitic Foods**: Curated ingredient database with therapeutic properties
- ✅ **Cleanse Phases**: Multi-phase protocol management with timeline tracking
- ✅ **Symptom Monitoring**: Detox reaction tracking and management
- ✅ **Safety Protocols**: Medical supervision requirements and contraindications

---

## 🔄 **New Workflow Processes (v2.0)**

### **Health Protocol Assignment Flow**
```
Trainer → Client Assessment → Health Ailments Selection → 
Protocol Template Selection → Custom Protocol Creation → 
Client Assignment → Progress Monitoring → Protocol Adjustment
```

### **Enhanced Progress Tracking Flow**
```
Customer → Comprehensive Measurements Entry → Photo Upload → 
Goal Setting → Milestone Tracking → Progress Analysis → 
Report Generation → Trainer Sharing (optional)
```

### **Professional PDF Export Flow**
```
User → Content Selection → Template Choice → Branding Options → 
Server-Side Processing (Puppeteer) → Professional PDF Generation → 
Download/Email Delivery → Print Optimization
```

### **Mobile User Experience Flow**
```
Mobile User → Responsive Interface → Touch Optimized Navigation → 
Progressive Loading → Offline Capability → Sync on Reconnect
```

---

**Document Control:**
- **Owner**: Development Team
- **Review Schedule**: Monthly or on major feature changes
- **Version Control**: Update version number on any changes
- **Current Version**: 2.0 (Production Release - August 7, 2025)
- **Related Documents**: 
  - `API_DOCUMENTATION.md` - Complete API endpoint specifications
  - `DATABASE_SCHEMA.md` - Database structure and relationships
  - `SECURITY.md` - Security best practices and incident response
  - `DEPLOYMENT_REPORT.md` - Production deployment procedures
  - `test/BUSINESS_LOGIC_TESTS_README.md` - Testing procedures and requirements