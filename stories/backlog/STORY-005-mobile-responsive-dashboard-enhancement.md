# Story: Mobile-Responsive Dashboard Enhancement

**Story ID:** STORY-005  
**Priority:** 🟠 High  
**Effort:** 7 days  
**Type:** UX Enhancement & Performance  
**Created:** 2025-08-26  
**Status:** Ready for Development  
**BMAD Agent:** Frontend UX/UI Specialist & Mobile Development Expert  

---

## Story Overview

### Problem Statement
The HealthProtocol application currently lacks comprehensive mobile optimization, resulting in poor user experience on mobile devices. With healthcare professionals increasingly using mobile devices for client management, the current desktop-first design creates usability barriers. Key issues include: poor touch target sizing, non-responsive navigation, difficult data entry on small screens, slow loading on mobile networks, and lack of offline functionality. The health protocol dashboards, meal plan management, and progress tracking interfaces need complete mobile optimization to serve the growing mobile user base effectively.

### Business Value
- **Increased Mobile Adoption**: 65% of healthcare professionals use mobile devices for client management
- **Improved User Retention**: Mobile-optimized interfaces reduce abandonment by 40%
- **Professional Credibility**: Modern mobile experience positions EvoFit as industry leader
- **Accessibility Compliance**: Better mobile support improves overall accessibility scores
- **Competitive Advantage**: Many health platform competitors lack comprehensive mobile optimization
- **Revenue Protection**: Poor mobile experience drives 30% of potential customers to competitors
- **Trainer Productivity**: Mobile-optimized workflows enable on-the-go client management

### Success Criteria
- [ ] Complete responsive design system working flawlessly on 320px-768px screen widths
- [ ] Touch-optimized interactions with 44px minimum touch targets throughout interface
- [ ] 50% improvement in mobile page load speeds through optimization techniques
- [ ] Progressive Web App (PWA) functionality with offline core features available
- [ ] Service worker implementation enabling offline protocol and client data access
- [ ] Mobile-specific navigation patterns with swipe gestures and finger-friendly controls
- [ ] Health protocol dashboards fully functional and intuitive on mobile devices
- [ ] Meal plan management optimized for mobile data entry and review workflows
- [ ] Progress tracking charts and data visualization optimized for mobile screens
- [ ] Profile image uploads working seamlessly on mobile devices with camera integration
- [ ] Customer invitation flows streamlined for mobile user experience

---

## Technical Context

### Current State Analysis
```
Current Mobile Experience Issues:
1. Desktop-first design with poor mobile scaling
2. Navigation header doesn't collapse properly on small screens
3. Touch targets smaller than 44px recommended minimum
4. Tables and data grids don't scroll horizontally on mobile
5. Form inputs too small and difficult to use on touch devices
6. No swipe gestures or mobile-specific interactions
7. Large images and assets cause slow loading on mobile networks
8. No offline functionality - requires constant internet connection
9. Progress charts are unreadable on small screens
10. PDF exports don't work well on mobile browsers
11. Multi-step forms are cumbersome on mobile devices
12. No PWA installation capability for mobile users
```

### Architecture Decision
Based on the current system and mobile requirements, we will implement:
- **Mobile-First Responsive System**: Complete Tailwind CSS mobile-first approach
- **Progressive Web App (PWA)**: Service worker implementation with offline capabilities
- **Touch-Optimized Components**: Custom mobile components with gesture support
- **Performance Optimization**: Image optimization, lazy loading, and mobile-specific bundling
- **Adaptive Navigation**: Mobile navigation drawer with gesture-based interactions
- **Mobile Data Management**: Optimized API calls and local storage for offline support

### Technical Dependencies
- React 18 with mobile-optimized hooks and state management
- Tailwind CSS with extended mobile breakpoints and touch utilities
- Vite PWA plugin for service worker and offline capabilities
- React Swipe and gesture libraries for touch interactions
- Sharp or similar for automatic image optimization
- React Query for offline-first data management
- Framer Motion for smooth mobile animations and transitions
- Capacitor (optional) for native mobile app features if needed

---

## Implementation Details

### Step 1: Mobile-First Responsive Foundation
```typescript
// client/src/hooks/use-responsive.tsx
import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveBreakpoints {
  const [responsive, setResponsive] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    isTouchDevice: false,
    orientation: 'landscape'
  });

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const breakpoints = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenSize: width < 480 ? 'xs' as const :
                   width < 640 ? 'sm' as const :
                   width < 768 ? 'md' as const :
                   width < 1024 ? 'lg' as const :
                   width < 1280 ? 'xl' as const : '2xl' as const,
        isTouchDevice,
        orientation: width > height ? 'landscape' as const : 'portrait' as const
      };
      
      setResponsive(breakpoints);
    };

    // Initial check
    updateResponsive();

    // Listen for resize events
    window.addEventListener('resize', updateResponsive);
    window.addEventListener('orientationchange', updateResponsive);

    return () => {
      window.removeEventListener('resize', updateResponsive);
      window.removeEventListener('orientationchange', updateResponsive);
    };
  }, []);

  return responsive;
}
```

```typescript
// client/src/components/mobile/MobileNavigation.tsx
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu, X, Home, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/use-responsive';

interface MobileNavigationProps {
  currentPath?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const navigationItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard', roles: ['admin', 'trainer'] },
    { label: 'Health Protocols', icon: FileText, path: '/health-protocols', roles: ['trainer'] },
    { label: 'Client Management', icon: Users, path: '/clients', roles: ['trainer'] },
    { label: 'Profile', icon: Settings, path: '/profile', roles: ['admin', 'trainer', 'customer'] },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  if (!isMobile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto w-auto"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">EvoFit</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1 h-auto w-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigationItems
                .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start px-3 py-2.5 h-auto text-left ${
                        isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => handleNavigate(item.path)}
                    >
                      <Icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  );
                })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3 shrink-0" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
```

### Step 2: Mobile-Optimized Health Protocol Dashboard
```typescript
// client/src/components/mobile/MobileHealthProtocolDashboard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Plus, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Star,
  Calendar
} from 'lucide-react';
import { useResponsive } from '../../hooks/use-responsive';
import { useSwipeable } from 'react-swipeable';

interface MobileProtocol {
  id: string;
  name: string;
  type: 'longevity' | 'parasite_cleanse' | 'detox' | 'energy';
  assignedClients: number;
  effectiveness: number;
  lastUpdated: Date;
  status: 'active' | 'draft' | 'archived';
}

export const MobileHealthProtocolDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentProtocol, setCurrentProtocol] = useState(0);
  const { isMobile, isTouchDevice } = useResponsive();
  
  // Sample data - would come from API
  const protocols: MobileProtocol[] = [
    {
      id: '1',
      name: 'Executive Longevity Protocol',
      type: 'longevity',
      assignedClients: 8,
      effectiveness: 89,
      lastUpdated: new Date('2025-08-25'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Gentle Parasite Cleanse',
      type: 'parasite_cleanse',
      assignedClients: 5,
      effectiveness: 92,
      lastUpdated: new Date('2025-08-24'),
      status: 'active'
    }
  ];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentProtocol < protocols.length - 1) {
        setCurrentProtocol(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentProtocol > 0) {
        setCurrentProtocol(prev => prev - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'longevity': return 'bg-blue-500';
      case 'parasite_cleanse': return 'bg-green-500';
      case 'detox': return 'bg-purple-500';
      case 'energy': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isMobile) {
    // Return desktop version or null
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">Health Protocols</h1>
            <p className="text-sm text-muted-foreground">
              {protocols.length} active protocols
            </p>
          </div>
          <Button size="sm" className="h-9 px-3">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="p-4 pb-0">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{protocols.length}</p>
                <p className="text-xs text-muted-foreground">Protocols</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {protocols.reduce((sum, p) => sum + p.assignedClients, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Protocol Carousel */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Recent Protocols</h2>
          <div className="flex space-x-1">
            {protocols.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentProtocol ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div {...(isTouchDevice ? swipeHandlers : {})} className="relative">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(-${currentProtocol * 100}%)`,
              width: `${protocols.length * 100}%`
            }}
          >
            {protocols.map((protocol, index) => (
              <Card 
                key={protocol.id} 
                className="flex-shrink-0 mr-4 last:mr-0"
                style={{ width: `calc(${100 / protocols.length}% - 12px)` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div 
                          className={`w-3 h-3 rounded-full ${getTypeColor(protocol.type)}`}
                        />
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(protocol.status)}`}
                        >
                          {protocol.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm leading-tight mb-1">
                        {protocol.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {protocol.assignedClients} clients assigned
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Effectiveness</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="font-medium">{protocol.effectiveness}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Updated {protocol.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'Protocol assigned', client: 'Sarah M.', time: '2h ago' },
                  { action: 'Progress updated', client: 'Mike R.', time: '4h ago' },
                  { action: 'New protocol created', client: '', time: '1d ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      {activity.client && (
                        <p className="text-xs text-muted-foreground">{activity.client}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {protocols.filter(p => p.status === 'active').map((protocol) => (
              <Card key={protocol.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(protocol.type)}`} />
                      <h3 className="text-sm font-medium">{protocol.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {protocol.assignedClients} clients • {protocol.effectiveness}% effective
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="p-4">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-sm font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-xs text-muted-foreground">
                  Detailed analytics coming soon
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation Space */}
      <div className="h-16" />
    </div>
  );
};
```

### Step 3: Touch-Optimized Form Components
```typescript
// client/src/components/mobile/MobileForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { useResponsive } from '../../hooks/use-responsive';

interface MobileFormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  error?: string;
}

const MobileFormField: React.FC<MobileFormFieldProps> = ({ 
  label, 
  required, 
  children, 
  description, 
  error 
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`space-y-2 ${isMobile ? 'mb-6' : 'mb-4'}`}>
      <Label className={`text-sm font-medium ${required ? 'required' : ''}`}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="space-y-1">
        {children}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized input component
export const MobileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
}> = ({ label, required, description, error, ...props }) => {
  return (
    <MobileFormField 
      label={label} 
      required={required} 
      description={description} 
      error={error}
    >
      <Input
        {...props}
        className="h-12 text-base" // Larger touch targets and text for mobile
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </MobileFormField>
  );
};

// Mobile-optimized textarea
export const MobileTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
}> = ({ label, required, description, error, ...props }) => {
  return (
    <MobileFormField 
      label={label} 
      required={required} 
      description={description} 
      error={error}
    >
      <Textarea
        {...props}
        className="min-h-[120px] text-base resize-none" // Better mobile experience
      />
    </MobileFormField>
  );
};

// Mobile-optimized select
export const MobileSelect: React.FC<{
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
}> = ({ label, required, description, error, placeholder, options, value, onValueChange }) => {
  return (
    <MobileFormField 
      label={label} 
      required={required} 
      description={description} 
      error={error}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="py-3">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </MobileFormField>
  );
};

// Mobile-optimized checkbox group
export const MobileCheckboxGroup: React.FC<{
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  options: Array<{ id: string; label: string; description?: string }>;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ label, required, description, error, options, value, onChange }) => {
  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionId]);
    } else {
      onChange(value.filter(id => id !== optionId));
    }
  };

  return (
    <MobileFormField 
      label={label} 
      required={required} 
      description={description} 
      error={error}
    >
      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id={option.id}
              checked={value.includes(option.id)}
              onCheckedChange={(checked) => handleCheckboxChange(option.id, !!checked)}
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Label 
                htmlFor={option.id} 
                className="text-sm font-medium leading-tight cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </MobileFormField>
  );
};

// Mobile-optimized form container
export const MobileForm: React.FC<{
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  isSubmitting?: boolean;
  actions?: React.ReactNode;
}> = ({ 
  title, 
  description, 
  onSubmit, 
  children, 
  submitText = 'Submit', 
  isSubmitting = false,
  actions 
}) => {
  const { isMobile } = useResponsive();

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <Card>
        <CardHeader className={isMobile ? 'p-4 pb-2' : undefined}>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        
        <CardContent className={isMobile ? 'p-4 pt-2' : undefined}>
          <form onSubmit={onSubmit} className="space-y-1">
            {children}
            
            <div className={`flex space-x-3 pt-4 ${isMobile ? 'pb-2' : ''}`}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 ${isMobile ? 'h-12 text-base' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : submitText}
              </Button>
              {actions}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Step 4: Progressive Web App (PWA) Implementation
```typescript
// vite-pwa.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.healthprotocol\.com\/api\/protocols/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'health-protocols-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            // Cache by user and protocol type for better personalization
            const url = new URL(request.url);
            return `${url.pathname}${url.search}`;
          }
        }
      },
      {
        urlPattern: /^https:\/\/api\.healthprotocol\.com\/api\/clients/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'clients-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }
        }
      }
    ]
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'EvoFit Health Protocol Manager',
    short_name: 'EvoFit Health',
    description: 'Professional health protocol management for trainers and clients',
    theme_color: '#2563eb',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    start_url: '/?pwa=1',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['health', 'fitness', 'medical', 'productivity'],
    screenshots: [
      {
        src: 'screenshot-narrow.png',
        sizes: '360x800',
        type: 'image/png',
        form_factor: 'narrow'
      },
      {
        src: 'screenshot-wide.png',
        sizes: '1024x768',
        type: 'image/png',
        form_factor: 'wide'
      }
    ]
  },
  devOptions: {
    enabled: true
  }
});
```

```typescript
// client/src/hooks/use-offline.tsx
import { useState, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';

interface OfflineState {
  isOnline: boolean;
  isOfflineReady: boolean;
  updateAvailable: boolean;
}

export function useOffline(): OfflineState & {
  updateApp: () => Promise<void>;
  showInstallPrompt: () => Promise<boolean>;
} {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineReady: false,
    updateAvailable: false
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Back online",
        description: "Internet connection restored",
        variant: "default"
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Working offline",
        description: "Some features may be limited",
        variant: "destructive"
      });
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });
      });

      // Listen for offline ready event
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_READY') {
          setState(prev => ({ ...prev, isOfflineReady: true }));
          toast({
            title: "App ready for offline use",
            description: "Core features available without internet",
            variant: "default"
          });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const updateApp = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  const showInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    
    return outcome === 'accepted';
  };

  return {
    ...state,
    updateApp,
    showInstallPrompt
  };
}
```

### Step 5: Mobile-Optimized Progress Tracking
```typescript
// client/src/components/mobile/MobileProgressTracking.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Camera, 
  Scale, 
  Target, 
  TrendingUp,
  Calendar,
  Plus,
  Edit3,
  Image
} from 'lucide-react';
import { useResponsive } from '../../hooks/use-responsive';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface MeasurementData {
  date: string;
  weight: number;
  bodyFat: number;
  muscle: number;
}

interface PhotoProgress {
  id: string;
  date: string;
  url: string;
  type: 'front' | 'side' | 'back';
}

export const MobileProgressTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isMobile } = useResponsive();

  // Sample data
  const measurementData: MeasurementData[] = [
    { date: '2025-08-01', weight: 180, bodyFat: 15, muscle: 45 },
    { date: '2025-08-08', weight: 178, bodyFat: 14.5, muscle: 45.2 },
    { date: '2025-08-15', weight: 176, bodyFat: 14, muscle: 45.5 },
    { date: '2025-08-22', weight: 175, bodyFat: 13.8, muscle: 45.8 },
  ];

  const currentMeasurements = measurementData[measurementData.length - 1];
  const previousMeasurements = measurementData[measurementData.length - 2];

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = ((change / previous) * 100);
    return { change: change.toFixed(1), percentage: percentage.toFixed(1) };
  };

  const weightChange = calculateChange(currentMeasurements.weight, previousMeasurements.weight);
  const bodyFatChange = calculateChange(currentMeasurements.bodyFat, previousMeasurements.bodyFat);
  const muscleChange = calculateChange(currentMeasurements.muscle, previousMeasurements.muscle);

  if (!isMobile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">Progress Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Track your health journey
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Scale className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-semibold">{currentMeasurements.weight}</p>
              <p className="text-xs text-muted-foreground">Weight (lbs)</p>
              <div className="flex items-center justify-center mt-1">
                <Badge 
                  variant={parseFloat(weightChange.change) < 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {parseFloat(weightChange.change) < 0 ? '' : '+'}{weightChange.change}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-lg font-semibold">{currentMeasurements.bodyFat}%</p>
              <p className="text-xs text-muted-foreground">Body Fat</p>
              <div className="flex items-center justify-center mt-1">
                <Badge 
                  variant={parseFloat(bodyFatChange.change) < 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {parseFloat(bodyFatChange.change) < 0 ? '' : '+'}{bodyFatChange.change}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-semibold">{currentMeasurements.muscle}%</p>
              <p className="text-xs text-muted-foreground">Muscle</p>
              <div className="flex items-center justify-center mt-1">
                <Badge 
                  variant={parseFloat(muscleChange.change) > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {parseFloat(muscleChange.change) < 0 ? '' : '+'}{muscleChange.change}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="measurements" className="text-xs">
              Data
            </TabsTrigger>
            <TabsTrigger value="photos" className="text-xs">
              Photos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Weight Trend Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [`${value} lbs`, 'Weight']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weight Loss Goal</span>
                    <span>5 lbs lost / 10 lbs target</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Body Fat Reduction</span>
                    <span>1.2% lost / 3% target</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Muscle Gain</span>
                    <span>0.8% gained / 2% target</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-3">
            {measurementData.slice().reverse().map((measurement, index) => (
              <Card key={measurement.date} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {new Date(measurement.date).toLocaleDateString()}
                    </span>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">Latest</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{measurement.weight}</p>
                    <p className="text-xs text-muted-foreground">Weight (lbs)</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{measurement.bodyFat}%</p>
                    <p className="text-xs text-muted-foreground">Body Fat</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{measurement.muscle}%</p>
                    <p className="text-xs text-muted-foreground">Muscle</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            {/* Photo Upload Section */}
            <Card className="p-4">
              <div className="text-center py-6">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-sm font-medium mb-2">Progress Photos</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Take photos to track your visual progress
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Image className="h-4 w-4 mr-1" />
                    Gallery
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Camera className="h-4 w-4 mr-1" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Photos */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'front', date: '2025-08-22' },
                { type: 'side', date: '2025-08-22' },
                { type: 'front', date: '2025-08-15' },
                { type: 'side', date: '2025-08-15' }
              ].map((photo, index) => (
                <Card key={index} className="aspect-[3/4] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-medium capitalize">{photo.type} View</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
```

### Step 6: Performance Optimization Implementation
```typescript
// client/src/utils/mobileOptimizations.ts
import { lazy, Suspense } from 'react';

// Lazy loading for mobile-specific components
export const LazyMobileNavigation = lazy(() => 
  import('../components/mobile/MobileNavigation').then(module => ({
    default: module.MobileNavigation
  }))
);

export const LazyMobileHealthProtocolDashboard = lazy(() => 
  import('../components/mobile/MobileHealthProtocolDashboard').then(module => ({
    default: module.MobileHealthProtocolDashboard
  }))
);

// Image optimization utility
export class MobileImageOptimizer {
  private static readonly MAX_MOBILE_WIDTH = 768;
  private static readonly QUALITY_SETTINGS = {
    high: 0.9,
    medium: 0.7,
    low: 0.5
  };

  static async optimizeForMobile(
    file: File, 
    maxWidth: number = this.MAX_MOBILE_WIDTH,
    quality: keyof typeof this.QUALITY_SETTINGS = 'medium'
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
          this.QUALITY_SETTINGS[quality]
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static createResponsiveSrcSet(baseUrl: string): string {
    const sizes = [320, 480, 640, 768];
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=75 ${size}w`)
      .join(', ');
  }
}

// Performance monitoring utility
export class MobilePerformanceMonitor {
  private static startTimes = new Map<string, number>();

  static startTimer(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const start = this.startTimes.get(name);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.startTimes.delete(name);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static measureNetworkSpeed(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      const image = new Image();
      
      image.onload = () => {
        const duration = performance.now() - start;
        // Estimate connection speed based on image load time
        const connectionSpeed = duration < 100 ? 'fast' : duration < 300 ? 'medium' : 'slow';
        resolve(duration);
      };
      
      image.onerror = () => resolve(1000); // Assume slow connection on error
      
      // Small test image to measure network speed
      image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    });
  }
}

// Touch gesture utility
export class TouchGestureHandler {
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;

  constructor(
    private element: HTMLElement,
    private callbacks: {
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      onSwipeUp?: () => void;
      onSwipeDown?: () => void;
      onTap?: () => void;
      onLongPress?: () => void;
    }
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    let longPressTimer: NodeJS.Timeout;

    this.element.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;

      // Long press detection
      longPressTimer = setTimeout(() => {
        this.callbacks.onLongPress?.();
      }, 500);
    });

    this.element.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);
      
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      
      this.handleGesture();
    });

    this.element.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });
  }

  private handleGesture(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const minSwipeDistance = 50;

    // Check if it's a tap (small movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      this.callbacks.onTap?.();
      return;
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          this.callbacks.onSwipeRight?.();
        } else {
          this.callbacks.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          this.callbacks.onSwipeDown?.();
        } else {
          this.callbacks.onSwipeUp?.();
        }
      }
    }
  }

  destroy(): void {
    // Remove event listeners
    this.element.removeEventListener('touchstart', () => {});
    this.element.removeEventListener('touchend', () => {});
    this.element.removeEventListener('touchmove', () => {});
  }
}
```

---

## Testing Strategy

### Mobile Responsive Testing
```typescript
// test/unit/mobile/responsiveDesign.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useResponsive } from '../../../client/src/hooks/use-responsive';
import { MobileNavigation } from '../../../client/src/components/mobile/MobileNavigation';

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
};

describe('Mobile Responsive Design', () => {
  beforeEach(() => {
    // Reset to desktop size
    mockWindowDimensions(1024, 768);
  });

  describe('useResponsive hook', () => {
    it('should detect mobile breakpoint correctly', () => {
      mockWindowDimensions(375, 667); // iPhone SE dimensions
      
      const TestComponent = () => {
        const { isMobile, screenSize } = useResponsive();
        return (
          <div>
            <span data-testid="is-mobile">{isMobile.toString()}</span>
            <span data-testid="screen-size">{screenSize}</span>
          </div>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      expect(screen.getByTestId('screen-size')).toHaveTextContent('xs');
    });

    it('should detect tablet breakpoint correctly', () => {
      mockWindowDimensions(768, 1024); // iPad dimensions
      
      const TestComponent = () => {
        const { isTablet, screenSize } = useResponsive();
        return (
          <div>
            <span data-testid="is-tablet">{isTablet.toString()}</span>
            <span data-testid="screen-size">{screenSize}</span>
          </div>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('is-tablet')).toHaveTextContent('true');
      expect(screen.getByTestId('screen-size')).toHaveTextContent('md');
    });

    it('should detect orientation changes', () => {
      mockWindowDimensions(667, 375); // Landscape phone
      
      const TestComponent = () => {
        const { orientation } = useResponsive();
        return <span data-testid="orientation">{orientation}</span>;
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
    });
  });

  describe('Mobile Navigation', () => {
    it('should render mobile navigation on small screens', () => {
      mockWindowDimensions(375, 667);
      
      render(<MobileNavigation currentPath="/dashboard" />);
      
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });

    it('should not render mobile navigation on desktop', () => {
      mockWindowDimensions(1200, 800);
      
      const { container } = render(<MobileNavigation currentPath="/dashboard" />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});
```

### Touch Interaction Testing
```typescript
// test/unit/mobile/touchInteractions.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TouchGestureHandler } from '../../../client/src/utils/mobileOptimizations';

describe('Touch Interactions', () => {
  it('should detect swipe left gesture', () => {
    const onSwipeLeft = vi.fn();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    new TouchGestureHandler(element, { onSwipeLeft });
    
    // Simulate touch events
    fireEvent.touchStart(element, {
      changedTouches: [{ screenX: 100, screenY: 100 }]
    });
    
    fireEvent.touchEnd(element, {
      changedTouches: [{ screenX: 50, screenY: 100 }]
    });
    
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(element);
  });

  it('should detect tap gesture', () => {
    const onTap = vi.fn();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    new TouchGestureHandler(element, { onTap });
    
    // Simulate tap (small movement)
    fireEvent.touchStart(element, {
      changedTouches: [{ screenX: 100, screenY: 100 }]
    });
    
    fireEvent.touchEnd(element, {
      changedTouches: [{ screenX: 102, screenY: 101 }]
    });
    
    expect(onTap).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(element);
  });

  it('should detect long press gesture', async () => {
    const onLongPress = vi.fn();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    new TouchGestureHandler(element, { onLongPress });
    
    // Simulate long press
    fireEvent.touchStart(element, {
      changedTouches: [{ screenX: 100, screenY: 100 }]
    });
    
    // Wait for long press timeout
    await new Promise(resolve => setTimeout(resolve, 600));
    
    expect(onLongPress).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(element);
  });
});
```

### End-to-End Mobile Testing
```typescript
// test/e2e/mobileResponsive.spec.ts
import { test, expect, devices } from '@playwright/test';

// Test on various mobile devices
const mobileDevices = [
  'iPhone 13',
  'iPhone 13 Pro Max',
  'Galaxy S21',
  'iPad Pro'
];

for (const deviceName of mobileDevices) {
  test.describe(`Mobile Experience - ${deviceName}`, () => {
    test.use({ ...devices[deviceName] });

    test('should display mobile-optimized navigation', async ({ page }) => {
      await page.goto('/health-protocols');
      
      // Should see mobile navigation trigger
      await expect(page.locator('[aria-label="Open navigation menu"]')).toBeVisible();
      
      // Should not see desktop navigation
      await expect(page.locator('.desktop-nav')).not.toBeVisible();
    });

    test('should handle touch interactions correctly', async ({ page }) => {
      await page.goto('/health-protocols');
      
      // Test tap interaction
      await page.locator('[data-testid="protocol-card"]:first-child').tap();
      
      // Should navigate or expand
      await expect(page.locator('[data-testid="protocol-details"]')).toBeVisible();
    });

    test('should load images optimally for mobile', async ({ page }) => {
      await page.goto('/profile');
      
      // Check that images are appropriately sized
      const profileImages = page.locator('img[data-testid="profile-image"]');
      
      if (await profileImages.count() > 0) {
        const firstImage = profileImages.first();
        const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
        const naturalHeight = await firstImage.evaluate((img: HTMLImageElement) => img.naturalHeight);
        
        // Should not load unnecessarily large images on mobile
        expect(naturalWidth).toBeLessThan(800);
        expect(naturalHeight).toBeLessThan(800);
      }
    });

    test('should work offline with PWA', async ({ page }) => {
      await page.goto('/health-protocols');
      
      // Wait for service worker to install
      await page.waitForTimeout(2000);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Should still show cached content
      await page.reload();
      await expect(page.locator('h1')).toContainText('Health Protocols');
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    });

    test('should handle form inputs on mobile', async ({ page }) => {
      await page.goto('/health-protocols/create');
      
      // Test mobile form interactions
      const protocolNameInput = page.locator('[data-testid="protocol-name"]');
      await protocolNameInput.tap();
      await protocolNameInput.fill('Mobile Test Protocol');
      
      // Should not zoom on input focus (viewport meta tag working)
      const viewportScale = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content')?.includes('user-scalable=no');
      });
      
      expect(viewportScale).toBe(true);
    });

    test('should optimize performance on slow networks', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', (route) => {
        return new Promise(resolve => {
          setTimeout(() => {
            route.continue();
            resolve(void 0);
          }, 100); // Add 100ms delay to all requests
        });
      });

      const startTime = Date.now();
      await page.goto('/health-protocols');
      
      // Should show loading states appropriately
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
      
      // Should complete loading within reasonable time even on slow network
      await expect(page.locator('h1')).toContainText('Health Protocols', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(8000); // Should load within 8 seconds even on slow network
    });
  });
}

test.describe('PWA Functionality', () => {
  test('should install as PWA', async ({ page, context }) => {
    await page.goto('/');
    
    // Should have PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href');
    
    // Should register service worker
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistration).toBe(true);
  });

  test('should cache resources for offline use', async ({ page }) => {
    await page.goto('/health-protocols');
    
    // Wait for caching
    await page.waitForTimeout(3000);
    
    // Go offline and check cached resources
    await page.context().setOffline(true);
    await page.goto('/health-protocols');
    
    // Should load from cache
    await expect(page.locator('h1')).toContainText('Health Protocols');
  });
});
```

### Performance Testing
```typescript
// test/performance/mobilePerformance.test.ts
import { describe, it, expect } from 'vitest';
import { MobilePerformanceMonitor, MobileImageOptimizer } from '../../client/src/utils/mobileOptimizations';

describe('Mobile Performance Optimizations', () => {
  describe('Performance Monitoring', () => {
    it('should track operation timing', () => {
      MobilePerformanceMonitor.startTimer('test-operation');
      
      // Simulate work
      const start = Date.now();
      while (Date.now() - start < 50) {
        // busy wait
      }
      
      const duration = MobilePerformanceMonitor.endTimer('test-operation');
      expect(duration).toBeGreaterThan(40);
      expect(duration).toBeLessThan(100);
    });

    it('should warn about slow operations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      MobilePerformanceMonitor.startTimer('slow-operation');
      
      // Simulate slow work
      const start = Date.now();
      while (Date.now() - start < 150) {
        // busy wait
      }
      
      MobilePerformanceMonitor.endTimer('slow-operation');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation detected: slow-operation')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Image Optimization', () => {
    it('should generate responsive srcset', () => {
      const srcSet = MobileImageOptimizer.createResponsiveSrcSet('https://example.com/image.jpg');
      
      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('480w');
      expect(srcSet).toContain('640w');
      expect(srcSet).toContain('768w');
    });

    it('should optimize images for mobile', async () => {
      // Create a test canvas as image source
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert to file
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const originalFile = new File([blob], 'test.png', { type: 'image/png' });
      
      // Optimize for mobile
      const optimizedFile = await MobileImageOptimizer.optimizeForMobile(originalFile, 600, 'medium');
      
      expect(optimizedFile.size).toBeLessThan(originalFile.size);
      expect(optimizedFile.type).toBe('image/jpeg');
    });
  });
});
```

---

## Acceptance Criteria Checklist

- [ ] **Responsive Design System**: Complete mobile-first responsive design working on all screen sizes from 320px-768px
- [ ] **Touch-Optimized Interface**: All interactive elements meet 44px minimum touch target requirement
- [ ] **Performance Optimization**: 50% improvement in mobile page load speeds through lazy loading and optimization
- [ ] **Progressive Web App**: Service worker implementation with offline core features functionality
- [ ] **Mobile Navigation**: Gesture-based navigation drawer with swipe interactions working smoothly  
- [ ] **Health Protocol Mobile UX**: Dashboard optimized for mobile data entry and protocol management
- [ ] **Meal Plan Mobile Interface**: Touch-friendly meal planning with mobile-specific interaction patterns
- [ ] **Progress Tracking Mobile**: Charts and data visualization optimized and readable on small screens
- [ ] **Mobile Image Upload**: Camera integration working seamlessly for profile pictures and progress photos
- [ ] **Customer Invitation Flow**: Mobile-optimized invitation and onboarding process with touch interactions
- [ ] **Offline Functionality**: Core features accessible without internet connection through service worker caching

---

## Definition of Done

1. **Mobile-First Responsive Foundation**: Complete responsive system with Tailwind CSS mobile-first approach and custom breakpoints
2. **Touch-Optimized Components**: All UI components optimized for touch with proper sizing and gesture support
3. **Progressive Web App Setup**: Full PWA implementation with service worker, offline caching, and installability
4. **Performance Optimizations**: Image optimization, lazy loading, and mobile-specific bundling reducing load times by 50%
5. **Mobile Navigation System**: Gesture-based navigation drawer with swipe interactions and mobile-specific patterns
6. **Health Protocol Mobile Interface**: Complete mobile optimization of dashboard, creation, and management workflows
7. **Progress Tracking Mobile**: Mobile-optimized charts, data entry, and photo management with touch interactions
8. **Comprehensive Testing Suite**: Unit, integration, and E2E tests covering all mobile functionality and performance benchmarks
9. **Cross-Device Compatibility**: Testing across iOS and Android devices, various screen sizes, and orientations
10. **Production Deployment**: All mobile features tested and deployed with performance monitoring and analytics

---

## Risk Mitigation

### Identified Risks
1. **Touch Interaction Complexity**: Complex gestures could confuse users or conflict with browser behavior
   - *Mitigation:* Implement standard gesture patterns, provide visual feedback, extensive user testing on real devices

2. **Performance on Low-End Devices**: Mobile optimizations might not be sufficient for older or budget mobile devices
   - *Mitigation:* Progressive enhancement, device capability detection, fallback to simpler interfaces for low-end devices

3. **PWA Installation Issues**: Different browsers and devices have varying PWA support and installation flows
   - *Mitigation:* Feature detection, graceful degradation, clear installation instructions for each platform

4. **Offline Data Synchronization**: Complex offline/online data sync could lead to data conflicts or loss
   - *Mitigation:* Conservative offline features initially, clear sync indicators, conflict resolution strategies

5. **Cross-Platform UI Inconsistencies**: Different mobile platforms might render components differently
   - *Mitigation:* Extensive cross-platform testing, CSS normalization, platform-specific tweaks where needed

6. **Network Performance Variability**: Mobile networks vary greatly in speed and reliability
   - *Mitigation:* Adaptive loading strategies, connection quality detection, optimistic UI updates

---

## Notes for Developer

### Implementation Priority Order
1. **Start with Responsive Foundation**: Implement mobile-first responsive system and basic components
2. **Add Touch Interactions**: Implement gesture handlers and touch-optimized components
3. **Build Mobile Navigation**: Create mobile-specific navigation patterns with smooth animations
4. **Optimize Core Dashboards**: Focus on health protocol and progress tracking mobile interfaces
5. **Implement PWA Features**: Add service worker and offline capabilities
6. **Performance Optimization**: Image optimization, lazy loading, and mobile-specific performance improvements

### Key Configuration Requirements
```bash
# Additional dependencies needed
npm install react-swipeable framer-motion
npm install @vite-plugin/pwa workbox-window
npm install sharp imagemin imagemin-mozjpeg imagemin-webp

# PWA configuration
VITE_PWA_ENABLED=true
VITE_OFFLINE_FEATURES=basic
VITE_SERVICE_WORKER_PRECACHE=true

# Performance settings
VITE_IMAGE_OPTIMIZATION=true
VITE_LAZY_LOADING=true
VITE_MOBILE_FIRST_BUNDLING=true
```

### Testing Approach
```bash
# Mobile responsive testing
npm test -- test/unit/mobile/

# Touch interaction testing  
npm test -- test/integration/touchInteractions.test.ts

# PWA functionality testing
npm test -- test/integration/pwaFeatures.test.ts

# Cross-device E2E testing
npm run test:e2e -- --project=mobile-devices

# Performance testing
npm run test:lighthouse -- --mobile
npm run test:performance -- --mobile-networks
```

### Mobile-Specific Monitoring
- **Core Web Vitals**: Monitor LCP, FID, and CLS specifically for mobile users
- **PWA Installation Rate**: Track PWA installation success and usage patterns
- **Touch Interaction Success Rate**: Monitor gesture recognition accuracy and user satisfaction
- **Offline Feature Usage**: Track offline feature usage and sync success rates
- **Mobile Network Performance**: Monitor performance across different network conditions
- **Cross-Platform Consistency**: Monitor UI rendering consistency across mobile platforms

### Development Environment Setup
```bash
# Mobile development tools
npm install -g @capacitor/cli  # For potential native app features
npm install -g lighthouse      # Mobile performance testing
npm install -g pwa-asset-generator  # PWA icon generation

# Browser testing setup
npm install -g browserstack-local  # Cross-device testing
```

---

## References
- [Web.dev Mobile Performance Best Practices](https://web.dev/fast/)
- [PWA Documentation - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Touch Design Guidelines - Material Design](https://material.io/design/usability/accessibility.html#touch-targets)
- [iOS Safari Mobile Web Standards](https://developer.apple.com/safari/resources/)
- [Android Chrome Mobile Development Guide](https://developer.chrome.com/docs/android/)
- [React Performance Optimization for Mobile](https://react.dev/learn/render-and-commit#epilogue-browser-paint)
- [Tailwind CSS Mobile-First Documentation](https://tailwindcss.com/docs/responsive-design)

---

_This story follows BMAD methodology with comprehensive mobile optimization context, performance considerations, and production-ready PWA architecture. Ready for development phase with extensive cross-platform testing and mobile-specific monitoring strategy._