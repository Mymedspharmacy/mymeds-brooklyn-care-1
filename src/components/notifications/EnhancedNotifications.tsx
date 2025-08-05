import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, AlertTriangle, Info, CheckCircle, XCircle, 
  Filter, Search, Eye, EyeOff, Trash2, CheckSquare,
  Clock, Star, MessageSquare, ShoppingCart, Pill, RefreshCw
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'order' | 'refill' | 'transfer' | 'contact' | 'system' | 'alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

interface EnhancedNotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onDelete: (id: number) => void;
  onAcknowledge: (id: number) => void;
  onFilterChange: (filters: NotificationFilters) => void;
}

interface NotificationFilters {
  priority: string;
  type: string;
  read: string;
  search: string;
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const TYPE_ICONS = {
  order: ShoppingCart,
  refill: Pill,
  transfer: RefreshCw,
  contact: MessageSquare,
  system: Info,
  alert: AlertTriangle
};

const TYPE_COLORS = {
  order: 'text-blue-600',
  refill: 'text-purple-600',
  transfer: 'text-orange-600',
  contact: 'text-green-600',
  system: 'text-gray-600',
  alert: 'text-red-600'
};

export function EnhancedNotifications({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onDelete, 
  onAcknowledge,
  onFilterChange 
}: EnhancedNotificationsProps) {
  const [filters, setFilters] = useState<NotificationFilters>({
    priority: 'all',
    type: 'all',
    read: 'all',
    search: ''
  });
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState<Notification | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.read === 'read' && !notification.read) return false;
    if (filters.read === 'unread' && notification.read) return false;
    if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
      setSelectAll(false);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
      setSelectAll(true);
    }
  };

  const handleNotificationSelection = (id: number) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(n => n !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkMarkRead = () => {
    selectedNotifications.forEach(id => onMarkRead(id));
    setSelectedNotifications([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => onDelete(id));
    setSelectedNotifications([]);
    setSelectAll(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Manage and track all system notifications</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {unreadCount} unread
            </Badge>
          )}
          {highPriorityCount > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {highPriorityCount} high priority
            </Badge>
          )}
          {unacknowledgedCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {unacknowledgedCount} unacknowledged
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Search</label>
              <Input
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="refill">Refill Requests</SelectItem>
                  <SelectItem value="transfer">Transfer Requests</SelectItem>
                  <SelectItem value="contact">Contact Requests</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={filters.read} onValueChange={(value) => handleFilterChange('read', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-brand"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkRead}
                className="text-green-600 hover:text-green-700"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Mark Read ({selectedNotifications.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedNotifications.length})
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const IconComponent = TYPE_ICONS[notification.type];
          return (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                selectedNotifications.includes(notification.id) ? 'ring-2 ring-brand' : ''
              } ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={() => handleNotificationSelection(notification.id)}
                    className="mt-1 data-[state=checked]:bg-brand"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${TYPE_COLORS[notification.type]}`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            <Badge className={PRIORITY_COLORS[notification.priority]}>
                              {notification.priority}
                            </Badge>
                            {!notification.acknowledged && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                Unacknowledged
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${!notification.read ? 'text-blue-700' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </span>
                            {notification.acknowledged && (
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Acknowledged {formatTimeAgo(notification.acknowledgedAt!)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!notification.acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAcknowledge(notification.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetails(notification)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new notifications.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {showDetails && TYPE_ICONS[showDetails.type] && (
                <showDetails.type className={`h-5 w-5 ${TYPE_COLORS[showDetails.type]}`} />
              )}
              <span>Notification Details</span>
            </DialogTitle>
          </DialogHeader>
          {showDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{showDetails.title}</h3>
                <p className="text-gray-600 mt-2">{showDetails.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <Badge className={`ml-2 ${PRIORITY_COLORS[showDetails.priority]}`}>
                    {showDetails.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {showDetails.type}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <Badge variant="outline" className={`ml-2 ${showDetails.read ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {showDetails.read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Acknowledged:</span>
                  <Badge variant="outline" className={`ml-2 ${showDetails.acknowledged ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {showDetails.acknowledged ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Created:</span> {new Date(showDetails.createdAt).toLocaleString()}</p>
                {showDetails.acknowledgedAt && (
                  <p><span className="font-medium">Acknowledged:</span> {new Date(showDetails.acknowledgedAt).toLocaleString()}</p>
                )}
              </div>
              
              {showDetails.data && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Data</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(showDetails.data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                {!showDetails.read && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onMarkRead(showDetails.id);
                      setShowDetails(null);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                {!showDetails.acknowledged && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAcknowledge(showDetails.id);
                      setShowDetails(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(showDetails.id);
                    setShowDetails(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 