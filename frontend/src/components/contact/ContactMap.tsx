'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  Phone,
  Clock,
  Car,
  Train,
  Plane,
  Info,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

interface ContactMapProps {
  className?: string;
  height?: number;
  showDirections?: boolean;
  showNearbyLandmarks?: boolean;
  showTransportInfo?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
}

interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hours?: string;
  type: 'main' | 'branch' | 'warehouse' | 'showroom';
  description?: string;
}

interface Landmark {
  name: string;
  type: 'airport' | 'station' | 'hospital' | 'hotel' | 'mall' | 'other';
  distance: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface TransportOption {
  type: 'car' | 'train' | 'plane' | 'bus';
  name: string;
  distance: string;
  duration: string;
  description: string;
  icon: React.ReactNode;
}

const locations: Location[] = [
  {
    name: 'Vardhman Mills - Head Office',
    address: 'Industrial Area, Sector 12, New Delhi, India 110025',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    phone: '+91 98765 43210',
    hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
    type: 'main',
    description: 'Our main manufacturing facility and corporate headquarters'
  },
  {
    name: 'Vardhman Mills - Showroom',
    address: 'Connaught Place, New Delhi, India 110001',
    coordinates: { lat: 28.6304, lng: 77.2177 },
    phone: '+91 98765 43211',
    hours: 'Mon-Sun: 10AM-8PM',
    type: 'showroom',
    description: 'Visit our showroom to see our latest textile collections'
  },
  {
    name: 'Vardhman Mills - Warehouse',
    address: 'Gurgaon Industrial Area, Haryana, India 122001',
    coordinates: { lat: 28.4595, lng: 77.0266 },
    phone: '+91 98765 43212',
    hours: 'Mon-Sat: 8AM-6PM',
    type: 'warehouse',
    description: 'Distribution center and bulk storage facility'
  }
];

const nearbyLandmarks: Landmark[] = [
  {
    name: 'Indira Gandhi International Airport',
    type: 'airport',
    distance: '15 km',
    coordinates: { lat: 28.5562, lng: 77.1000 }
  },
  {
    name: 'New Delhi Railway Station',
    type: 'station',
    distance: '8 km',
    coordinates: { lat: 28.6434, lng: 77.2195 }
  },
  {
    name: 'Max Hospital',
    type: 'hospital',
    distance: '3 km',
    coordinates: { lat: 28.6050, lng: 77.2100 }
  },
  {
    name: 'Select City Walk Mall',
    type: 'mall',
    distance: '5 km',
    coordinates: { lat: 28.5245, lng: 77.2066 }
  }
];

const transportOptions: TransportOption[] = [
  {
    type: 'car',
    name: 'By Car',
    distance: 'Various routes available',
    duration: '30-60 mins from city center',
    description: 'Parking available on-site. Take Ring Road to Industrial Area.',
    icon: <Car className="w-5 h-5" />
  },
  {
    type: 'train',
    name: 'By Metro/Train',
    distance: '2 km from nearest metro',
    duration: '45-75 mins from city center',
    description: 'Take Blue Line to Yamuna Bank, then taxi/auto-rickshaw.',
    icon: <Train className="w-5 h-5" />
  },
  {
    type: 'plane',
    name: 'By Air',
    distance: '15 km from IGI Airport',
    duration: '30-45 mins from airport',
    description: 'Direct taxi/cab available from airport terminal.',
    icon: <Plane className="w-5 h-5" />
  }
];

const ContactMap: React.FC<ContactMapProps> = ({
  className,
  showDirections = true,
  showNearbyLandmarks = true,
  showTransportInfo = true,
  variant = 'default'
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(locations[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const openInMaps = useCallback((location: Location) => {
    const query = encodeURIComponent(location.address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(googleMapsUrl, '_blank');
  }, []);

  const getDirections = useCallback((location: Location) => {
    const destination = encodeURIComponent(location.address);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(directionsUrl, '_blank');
  }, []);

  const getLandmarkIcon = (type: string) => {
    switch (type) {
      case 'airport':
        return <Plane className="w-4 h-4" />;
      case 'station':
        return <Train className="w-4 h-4" />;
      case 'hospital':
        return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">H</div>;
      case 'hotel':
        return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">H</div>;
      case 'mall':
        return <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">M</div>;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-red-500';
      case 'branch':
        return 'bg-blue-500';
      case 'warehouse':
        return 'bg-green-500';
      case 'showroom':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const MapPlaceholder = () => (
    <div className={cn(
      'bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden',
      isFullscreen ? 'h-[80vh]' : 'h-96'
    )}>
      {!mapLoaded ? (
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      ) : (
        <>
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-green-100">
            {/* Simulated Roads */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-300 transform rotate-12" />
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -rotate-6" />
            <div className="absolute bottom-1/4 left-0 right-0 h-1.5 bg-gray-300 transform rotate-3" />
            
            {/* Location Markers */}
            {locations.map((location, index) => {
              return (
                <motion.div
                  key={location.name}
                  className={cn(
                    'absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform transition-transform hover:scale-110',
                    getLocationTypeColor(location.type),
                    selectedLocation.name === location.name && 'ring-4 ring-primary-200',
                    // Dynamic positioning using index
                    index === 0 ? 'left-[30%] top-[40%]' :
                    index === 1 ? 'left-[55%] top-[50%]' :
                    'left-[80%] top-[60%]'
                  )}
                  onClick={() => setSelectedLocation(location)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={selectedLocation.name === location.name ? {
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 2 }
                  } : {}}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </motion.div>
              );
            })}

            {/* Landmark Markers */}
            {showNearbyLandmarks && nearbyLandmarks.map((landmark, index) => (
              <div
                key={landmark.name}
                className={cn(
                  'absolute w-4 h-4 bg-gray-600 rounded-sm border border-white shadow-sm',
                  // Dynamic positioning for landmarks
                  index === 0 ? 'right-[20%] bottom-[30%]' :
                  index === 1 ? 'right-[35%] bottom-[38%]' :
                  index === 2 ? 'right-[50%] bottom-[46%]' :
                  'right-[65%] bottom-[54%]'
                )}
                title={landmark.name}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  {getLandmarkIcon(landmark.type)}
                </div>
              </div>
            ))}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFullscreen}
              className="bg-white shadow-md"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openInMaps(selectedLocation)}
              className="bg-white shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Location Info Overlay */}
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 bg-white/95 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full mt-1.5',
                  getLocationTypeColor(selectedLocation.type)
                )} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedLocation.address}
                  </p>
                  {selectedLocation.description && (
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedLocation.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {selectedLocation.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedLocation.phone}
                      </span>
                    )}
                    {selectedLocation.hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedLocation.hours}
                      </span>
                    )}
                  </div>
                </div>
                {showDirections && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => getDirections(selectedLocation)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-4', className)}>
        <MapPlaceholder />
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => openInMaps(selectedLocation)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Location Selector */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Our Locations</h2>
            <p className="text-gray-600">Find us at multiple convenient locations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <motion.div
              key={location.name}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                selectedLocation.name === location.name
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
              onClick={() => setSelectedLocation(location)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full mt-2',
                  getLocationTypeColor(location.type)
                )} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {location.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs mb-2 capitalize"
                  >
                    {location.type}
                  </Badge>
                  <p className="text-sm text-gray-600 mb-2">
                    {location.address}
                  </p>
                  {location.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {location.phone}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Tabbed Content */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Map View</TabsTrigger>
            {showNearbyLandmarks && (
              <TabsTrigger value="landmarks">Nearby Places</TabsTrigger>
            )}
            {showTransportInfo && (
              <TabsTrigger value="transport">How to Reach</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="map" className="p-0">
            <div ref={mapRef}>
              <MapPlaceholder />
            </div>
          </TabsContent>

          {showNearbyLandmarks && (
            <TabsContent value="landmarks" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Nearby Landmarks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyLandmarks.map((landmark) => (
                    <div 
                      key={landmark.name} 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-gray-600">
                        {getLandmarkIcon(landmark.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {landmark.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {landmark.distance} away
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {landmark.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {showTransportInfo && (
            <TabsContent value="transport" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Transportation Options
                </h3>
                <div className="space-y-4">
                  {transportOptions.map((option) => (
                    <Card key={option.type} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {option.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-sm text-gray-500">Distance:</span>
                              <p className="text-sm font-medium text-gray-900">
                                {option.distance}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Duration:</span>
                              <p className="text-sm font-medium text-gray-900">
                                {option.duration}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getDirections(selectedLocation)}
                          className="flex items-center gap-1"
                        >
                          <Route className="w-4 h-4" />
                          Get Directions
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          variant="default"
          onClick={() => openInMaps(selectedLocation)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </Button>
        {showDirections && (
          <Button
            variant="outline"
            onClick={() => getDirections(selectedLocation)}
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.open(`tel:${selectedLocation.phone?.replace(/\s/g, '')}`)}
          className="flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Call Location
        </Button>
      </div>
    </div>
  );
};

export default ContactMap;