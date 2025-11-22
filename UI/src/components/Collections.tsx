import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Bookmark, 
  Search, 
  Plus, 
  FileText, 
  Heart, 
  Star,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const mockCollections = [
  {
    id: 1,
    title: "Weight Loss Templates",
    description: "Curated diet plans for effective weight management",
    itemCount: 12,
    category: "templates",
    tags: ["weight-loss", "vata", "kapha"],
    saved: true,
    lastModified: "2 days ago"
  },
  {
    id: 2,
    title: "Digestive Health Resources",
    description: "Foods and practices for optimal digestion",
    itemCount: 8,
    category: "resources",
    tags: ["digestion", "pitta", "agni"],
    saved: false,
    lastModified: "1 week ago"
  },
  {
    id: 3,
    title: "Seasonal Diet Plans",
    description: "Diet recommendations based on seasons",
    itemCount: 24,
    category: "templates",
    tags: ["seasonal", "ayurveda", "dosha"],
    saved: true,
    lastModified: "3 days ago"
  },
  {
    id: 4,
    title: "Therapeutic Recipes",
    description: "Healing recipes for specific conditions",
    itemCount: 15,
    category: "recipes",
    tags: ["therapeutic", "healing", "medicine"],
    saved: false,
    lastModified: "5 days ago"
  },
  {
    id: 5,
    title: "Pregnancy Nutrition",
    description: "Safe and nourishing foods for expecting mothers",
    itemCount: 18,
    category: "templates",
    tags: ["pregnancy", "nutrition", "safety"],
    saved: true,
    lastModified: "1 day ago"
  },
  {
    id: 6,
    title: "Detox Protocols",
    description: "Cleansing and detoxification programs",
    itemCount: 7,
    category: "protocols",
    tags: ["detox", "cleanse", "panchakarma"],
    saved: false,
    lastModified: "1 week ago"
  }
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "templates", label: "Diet Templates" },
  { value: "resources", label: "Resources" },
  { value: "recipes", label: "Recipes" },
  { value: "protocols", label: "Protocols" }
];

export function Collections() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const filteredCollections = mockCollections.filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || collection.category === selectedCategory;
    const matchesSaved = !showSavedOnly || collection.saved;
    
    return matchesSearch && matchesCategory && matchesSaved;
  });

  const toggleSaved = (collectionId) => {
    // Mock function to toggle saved status
    console.log(`Toggling saved status for collection ${collectionId}`);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'templates': return FileText;
      case 'recipes': return Heart;
      case 'protocols': return Star;
      default: return Bookmark;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Collections</h1>
          <p className="text-muted-foreground">Save and manage your diet templates, resources, and protocols</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Collection
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search collections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={showSavedOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowSavedOnly(!showSavedOnly)}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Saved Only
          </Button>
          
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === 'grid' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collections Grid/List */}
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "space-y-4"
      }>
        {filteredCollections.map((collection) => {
          const CategoryIcon = getCategoryIcon(collection.category);
          
          if (viewMode === 'list') {
            return (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg">{collection.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {collection.itemCount} items
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {collection.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaved(collection.id)}
                        className={collection.saved ? 'text-primary' : ''}
                      >
                        <Bookmark className={`w-4 h-4 ${collection.saved ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={collection.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaved(collection.id)}
                    className={collection.saved ? 'text-primary' : ''}
                  >
                    <Bookmark className={`w-4 h-4 ${collection.saved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <CardTitle className="text-lg">{collection.title}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">
                      {collection.itemCount} items
                    </Badge>
                    <span className="text-muted-foreground">{collection.lastModified}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {collection.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{collection.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg text-muted-foreground mb-2">No collections found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}