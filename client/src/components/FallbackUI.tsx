import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Utensils, LogIn, BookOpen, Settings, Database, RefreshCw } from "lucide-react";

export default function FallbackUI() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Utensils className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-slate-800">FitMeal Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/api/login'}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="recipes">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Recipes
            </TabsTrigger>
            <TabsTrigger value="meal-plan">
              <Utensils className="w-4 h-4 mr-2" />
              Meal Plan Generator
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            <Card className="text-center py-12">
              <CardContent>
                <Database className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Database Connection Issue</h3>
                <p className="text-slate-600 mb-4">Unable to connect to database. Please try again in a moment.</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal-plan">
            <Card className="text-center py-12">
              <CardContent>
                <Utensils className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Meal Plan Generator</h3>
                <p className="text-slate-600 mb-4">Database connection required to generate meal plans.</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="text-center py-12">
              <CardContent>
                <Settings className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Admin Panel</h3>
                <p className="text-slate-600 mb-4">Admin features require database connectivity.</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}