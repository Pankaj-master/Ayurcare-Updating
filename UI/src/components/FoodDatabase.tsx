import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  Apple, 
  Flame, 
  Snowflake, 
  Zap,
  Leaf,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const mockFoodDatabase = [
  {
    id: 1,
    name: "Basmati Rice",
    category: "Grains",
    calories: 205,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    rasa: ["Sweet"],
    virya: "Cooling",
    vipaka: "Sweet",
    dosha: { vata: "Balancing", pitta: "Balancing", kapha: "Increasing" },
    guna: ["Light", "Dry"],
    description: "A fragrant long-grain rice that is cooling and easy to digest"
  },
  {
    id: 2,
    name: "Turmeric",
    category: "Spices",
    calories: 29,
    protein: 0.9,
    carbs: 6.3,
    fat: 0.3,
    fiber: 2.1,
    rasa: ["Bitter", "Pungent"],
    virya: "Heating",
    vipaka: "Pungent",
    dosha: { vata: "Balancing", pitta: "Slightly Increasing", kapha: "Reducing" },
    guna: ["Light", "Dry", "Rough"],
    description: "Golden spice with anti-inflammatory and digestive properties"
  },
  {
    id: 3,
    name: "Ghee",
    category: "Fats",
    calories: 112,
    protein: 0,
    carbs: 0,
    fat: 12.7,
    fiber: 0,
    rasa: ["Sweet"],
    virya: "Cooling",
    vipaka: "Sweet",
    dosha: { vata: "Reducing", pitta: "Reducing", kapha: "Increasing" },
    guna: ["Heavy", "Unctuous", "Soft"],
    description: "Clarified butter that enhances digestion and nourishes tissues"
  },
  {
    id: 4,
    name: "Mung Beans",
    category: "Legumes",
    calories: 104,
    protein: 7.0,
    carbs: 19.2,
    fat: 0.4,
    fiber: 7.6,
    rasa: ["Sweet", "Astringent"],
    virya: "Cooling",
    vipaka: "Sweet",
    dosha: { vata: "Neutral", pitta: "Reducing", kapha: "Reducing" },
    guna: ["Light", "Dry"],
    description: "Easy-to-digest legume ideal for detoxification and building strength"
  },
  {
    id: 5,
    name: "Ginger",
    category: "Spices",
    calories: 4,
    protein: 0.1,
    carbs: 0.9,
    fat: 0,
    fiber: 0.1,
    rasa: ["Pungent", "Sweet"],
    virya: "Heating",
    vipaka: "Sweet",
    dosha: { vata: "Reducing", pitta: "Increasing", kapha: "Reducing" },
    guna: ["Heavy", "Unctuous", "Hot"],
    description: "Warming spice that improves digestion and circulation"
  },
  {
    id: 6,
    name: "Coconut",
    category: "Fruits",
    calories: 354,
    protein: 3.3,
    carbs: 15.2,
    fat: 33.5,
    fiber: 9.0,
    rasa: ["Sweet"],
    virya: "Cooling",
    vipaka: "Sweet",
    dosha: { vata: "Reducing", pitta: "Reducing", kapha: "Increasing" },
    guna: ["Heavy", "Unctuous", "Cool"],
    description: "Cooling and nourishing fruit that provides sustained energy"
  }
];

const rasaColors = {
  "Sweet": "bg-green-100 text-green-800",
  "Sour": "bg-yellow-100 text-yellow-800",
  "Salty": "bg-blue-100 text-blue-800",
  "Pungent": "bg-red-100 text-red-800",
  "Bitter": "bg-gray-100 text-gray-800",
  "Astringent": "bg-purple-100 text-purple-800"
};

const doshaEffectColors = {
  "Reducing": "text-green-600",
  "Balancing": "text-blue-600",
  "Increasing": "text-red-600",
  "Neutral": "text-gray-600",
  "Slightly Increasing": "text-orange-600"
};

export function FoodDatabase() {
  const [foods, setFoods] = useState(mockFoodDatabase);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRasa, setFilterRasa] = useState('all');
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    category: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    rasa: [],
    virya: '',
    vipaka: '',
    dosha: { vata: '', pitta: '', kapha: '' },
    guna: [],
    description: ''
  });

  const categories = ["Grains", "Legumes", "Vegetables", "Fruits", "Spices", "Fats", "Dairy", "Nuts & Seeds"];
  const rasaOptions = ["Sweet", "Sour", "Salty", "Pungent", "Bitter", "Astringent"];
  const viryaOptions = ["Heating", "Cooling"];
  const vipakaOptions = ["Sweet", "Sour", "Pungent"];
  const doshaEffects = ["Reducing", "Balancing", "Increasing", "Neutral", "Slightly Increasing"];
  const gunaOptions = ["Heavy", "Light", "Unctuous", "Dry", "Hot", "Cold", "Soft", "Rough", "Sharp", "Dull"];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || food.category === filterCategory;
    const matchesRasa = filterRasa === 'all' || food.rasa.includes(filterRasa);
    return matchesSearch && matchesCategory && matchesRasa;
  });

  const handleAddFood = () => {
    if (newFood.name && newFood.category && newFood.calories) {
      const food = {
        id: foods.length + 1,
        ...newFood,
        calories: parseFloat(newFood.calories),
        protein: parseFloat(newFood.protein) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fat: parseFloat(newFood.fat) || 0,
        fiber: parseFloat(newFood.fiber) || 0
      };
      setFoods([...foods, food]);
      setNewFood({
        name: '', category: '', calories: '', protein: '', carbs: '', fat: '', fiber: '',
        rasa: [], virya: '', vipaka: '', dosha: { vata: '', pitta: '', kapha: '' },
        guna: [], description: ''
      });
      setIsAddFoodOpen(false);
    }
  };

  const toggleRasa = (rasa) => {
    setNewFood(prev => ({
      ...prev,
      rasa: prev.rasa.includes(rasa) 
        ? prev.rasa.filter(r => r !== rasa)
        : [...prev.rasa, rasa]
    }));
  };

  const toggleGuna = (guna) => {
    setNewFood(prev => ({
      ...prev,
      guna: prev.guna.includes(guna) 
        ? prev.guna.filter(g => g !== guna)
        : [...prev.guna, guna]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Food Database</h1>
          <p className="text-muted-foreground">Manage food items with nutritional and Ayurvedic properties</p>
        </div>
        
        <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Food Item</DialogTitle>
              <DialogDescription>
                Enter nutritional and Ayurvedic properties for the new food item
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg text-primary">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="food-name">Food Name *</Label>
                  <Input
                    id="food-name"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    placeholder="Enter food name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newFood.category} onValueChange={(value) => setNewFood({...newFood, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories (per 100g) *</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={newFood.calories}
                      onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                      placeholder="205"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      value={newFood.protein}
                      onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
                      placeholder="4.3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({...newFood, carbs: e.target.value})}
                      placeholder="45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      value={newFood.fat}
                      onChange={(e) => setNewFood({...newFood, fat: e.target.value})}
                      placeholder="0.4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      step="0.1"
                      value={newFood.fiber}
                      onChange={(e) => setNewFood({...newFood, fiber: e.target.value})}
                      placeholder="0.6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newFood.description}
                    onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                    placeholder="Brief description of the food and its properties"
                    rows={3}
                  />
                </div>
              </div>

              {/* Ayurvedic Properties */}
              <div className="space-y-4">
                <h3 className="text-lg text-primary">Ayurvedic Properties</h3>
                
                <div className="space-y-2">
                  <Label>Rasa (Taste)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {rasaOptions.map(rasa => (
                      <Button
                        key={rasa}
                        type="button"
                        variant={newFood.rasa.includes(rasa) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRasa(rasa)}
                        className="text-xs"
                      >
                        {rasa}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Virya (Energy)</Label>
                    <Select value={newFood.virya} onValueChange={(value) => setNewFood({...newFood, virya: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select virya" />
                      </SelectTrigger>
                      <SelectContent>
                        {viryaOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vipaka (Post-digestive taste)</Label>
                    <Select value={newFood.vipaka} onValueChange={(value) => setNewFood({...newFood, vipaka: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vipaka" />
                      </SelectTrigger>
                      <SelectContent>
                        {vipakaOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dosha Effects</Label>
                  <div className="space-y-2">
                    {['vata', 'pitta', 'kapha'].map(dosha => (
                      <div key={dosha} className="flex items-center space-x-2">
                        <Label className="w-12 capitalize">{dosha}:</Label>
                        <Select 
                          value={newFood.dosha[dosha]} 
                          onValueChange={(value) => setNewFood({
                            ...newFood, 
                            dosha: { ...newFood.dosha, [dosha]: value }
                          })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Effect" />
                          </SelectTrigger>
                          <SelectContent>
                            {doshaEffects.map(effect => (
                              <SelectItem key={effect} value={effect}>{effect}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Guna (Qualities)</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {gunaOptions.map(guna => (
                      <Button
                        key={guna}
                        type="button"
                        variant={newFood.guna.includes(guna) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleGuna(guna)}
                        className="text-xs"
                      >
                        {guna}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddFoodOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFood} className="bg-primary hover:bg-primary/90">
                Add Food Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterRasa} onValueChange={setFilterRasa}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Rasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rasas</SelectItem>
                  {rasaOptions.map(rasa => (
                    <SelectItem key={rasa} value={rasa}>{rasa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => (
          <Card key={food.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{food.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {food.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-primary">{food.calories}</p>
                  <p className="text-xs text-muted-foreground">cal/100g</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Nutritional Information */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-sm">{food.protein}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-sm">{food.carbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-sm">{food.fat}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fiber</p>
                  <p className="text-sm">{food.fiber}g</p>
                </div>
              </div>

              {/* Rasa */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Rasa (Taste)</p>
                <div className="flex flex-wrap gap-1">
                  {food.rasa.map((rasa, index) => (
                    <Badge key={index} className={`${rasaColors[rasa]} border-0 text-xs`}>
                      {rasa}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Virya and Vipaka */}
              <div className="flex space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  {food.virya === 'Heating' ? 
                    <Flame className="w-3 h-3 text-red-500" /> : 
                    <Snowflake className="w-3 h-3 text-blue-500" />
                  }
                  <span>Virya: {food.virya}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-accent" />
                  <span>Vipaka: {food.vipaka}</span>
                </div>
              </div>

              {/* Dosha Effects */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Dosha Effects</p>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {Object.entries(food.dosha).map(([dosha, effect]) => (
                    <div key={dosha} className="text-center">
                      <p className="text-muted-foreground capitalize">{dosha}</p>
                      <p className={doshaEffectColors[effect]}>{effect}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {food.description && (
                <p className="text-xs text-muted-foreground">{food.description}</p>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Plus className="w-3 h-3 mr-1" />
                  Add to Meal
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs space-y-2">
                        <p className="text-sm">Guna (Qualities):</p>
                        <div className="flex flex-wrap gap-1">
                          {food.guna.map((guna, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {guna}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No food items found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddFoodOpen(true)}
            >
              Add the first food item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}