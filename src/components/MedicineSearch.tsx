import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Pill, Info, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import api from '../lib/api';

interface DrugSearchResult {
  openfda: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    substance_name?: string[];
    product_type?: string[];
  };
  products: Array<{
    active_ingredients?: Array<{
      name: string;
      strength: string;
    }>;
    dosage_form?: string;
    route?: string;
    marketing_status?: string;
  }>;
  adverse_reactions?: string[];
  warnings?: string[];
  precautions?: string[];
  drug_interactions?: string[];
  pregnancy?: string[];
  pediatric_use?: string[];
  geriatric_use?: string[];
  clinical_pharmacology?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
}

interface SearchResponse {
  success: boolean;
  data: {
    meta: {
      results: {
        total: number;
      };
    };
    results: DrugSearchResult[];
  };
}

interface MedicineSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicineSearch({ isOpen, onClose }: MedicineSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async () => {
    if (searchQuery.length < 2) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await api.get(`/openfda/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
      
      if (response.data.success) {
        setSearchResults(response.data.data.results || []);
      } else {
        setError('Failed to search drugs');
      }
    } catch (err: any) {
      console.error('Medicine search error:', err);
      setError(err.response?.data?.message || 'Failed to search drugs');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDrugSelect = async (drug: DrugSearchResult) => {
    setSelectedDrug(drug);
    setShowDetails(true);
  };

  const getDrugName = (drug: DrugSearchResult) => {
    return drug.openfda.brand_name?.[0] || 
           drug.openfda.generic_name?.[0] || 
           drug.openfda.substance_name?.[0] || 
           'Unknown Drug';
  };

  const getDrugType = (drug: DrugSearchResult) => {
    return drug.openfda.product_type?.[0] || 'Unknown Type';
  };

  const getManufacturer = (drug: DrugSearchResult) => {
    return drug.openfda.manufacturer_name?.[0] || 'Unknown Manufacturer';
  };

  const formatText = (text: string | string[] | undefined) => {
    if (!text) return 'No information available';
    if (Array.isArray(text)) {
      return text.join(' ');
    }
    return text;
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Medicine Search
            <Badge variant="secondary" className="ml-2">
              OpenFDA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for medicines, drugs, or active ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Found {searchResults.length} results
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchResults([])}
                >
                  Clear
                </Button>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {searchResults.map((drug, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                      onClick={() => handleDrugSelect(drug)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {getDrugName(drug)}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getDrugType(drug)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {getManufacturer(drug)}
                              </span>
                            </div>
                            {drug.products?.[0]?.active_ingredients && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                  <strong>Active Ingredients:</strong>{' '}
                                  {drug.products[0].active_ingredients.map(ing => 
                                    `${ing.name} ${ing.strength}`
                                  ).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                          <Info className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* No Results */}
          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Pill className="h-8 w-8 mb-2" />
              <p>No medicines found for "{searchQuery}"</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {/* Initial State */}
          {searchQuery.length < 2 && !isSearching && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p>Start typing to search for medicines</p>
              <p className="text-sm">Search by brand name, generic name, or active ingredient</p>
            </div>
          )}
        </div>

        {/* Drug Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                {selectedDrug ? getDrugName(selectedDrug) : 'Drug Details'}
              </DialogTitle>
            </DialogHeader>

            {selectedDrug && (
              <ScrollArea className="h-96">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Brand Name</label>
                            <p className="text-sm">{selectedDrug.openfda.brand_name?.[0] || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Generic Name</label>
                            <p className="text-sm">{selectedDrug.openfda.generic_name?.[0] || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                            <p className="text-sm">{getManufacturer(selectedDrug)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Product Type</label>
                            <p className="text-sm">{getDrugType(selectedDrug)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedDrug.products?.[0]?.active_ingredients && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Active Ingredients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedDrug.products[0].active_ingredients.map((ingredient, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{ingredient.name}</span>
                                <Badge variant="secondary">{ingredient.strength}</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Clinical Pharmacology</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.clinical_pharmacology)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Indications and Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.indications_and_usage)}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="safety" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Warnings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.warnings)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Precautions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.precautions)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Adverse Reactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.adverse_reactions)}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="usage" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dosage and Administration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.dosage_and_administration)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Drug Interactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatText(selectedDrug.drug_interactions)}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
