import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { getActiveNotifications, dismissAll } from '../../utils/notifications';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Poll for notifications every 100ms
    const interval = setInterval(() => {
      const active = getActiveNotifications();
      setNotifications(active);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const handleActionClick = (action, notification) => {
    action.handler(notification.context);
    // Dismiss the notification after action
    dismissNotification(notification.id);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className={`
              p-4 rounded-lg border shadow-lg backdrop-blur-sm
              ${getSeverityStyles(notification.severity)}
            `}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.severity)}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {notification.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {notification.message}
                </p>
                
                {/* Action buttons */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.map((action) => (
                      <button
                        key={action.key}
                        onClick={() => handleActionClick(action, notification)}
                        className={`
                          px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                          ${action.variant === 'primary' 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dismiss button */}
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Dismiss all button when multiple notifications */}
      {notifications.length > 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            dismissAll();
            setNotifications([]);
          }}
          className="w-full mt-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 
                     bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md border border-gray-200 dark:border-gray-700
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Dismiss All ({notifications.length})
        </motion.button>
      )}
    </div>
  );
};

export default NotificationToast; 