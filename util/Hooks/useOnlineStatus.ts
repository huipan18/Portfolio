import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'slow';

export function useOnlineStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Network endpoints to test connectivity (in order of preference)
  const testEndpoints = [
    'https://www.google.com/favicon.ico',
    'https://www.cloudflare.com/favicon.ico',
    'https://httpbin.org/status/200',
    'https://jsonplaceholder.typicode.com/posts/1'
  ];

  const checkNetworkConnectivity = useCallback(async (): Promise<ConnectionStatus> => {
    if (!navigator.onLine) {
      return 'offline';
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        const responseTime = Date.now() - startTime;

        // If request succeeds, check response time
        if (responseTime > 5000) {
          return 'slow'; // Slower than 5 seconds
        } else if (responseTime > 2000) {
          return 'slow'; // Slower than 2 seconds
        }

        return 'online';
      } catch (error: any) {
        // If it's an abort error, return current status
        if (error.name === 'AbortError') {
          return 'offline'; // Default to offline on abort
        }
        // Try next endpoint
        continue;
      }
    }

    // If all endpoints fail, we're offline
    return 'offline';
  }, []); // Remove connectionStatus dependency

  const performConnectivityCheck = useCallback(async () => {
    setIsChecking(current => {
      if (current) return current; // Early return if already checking
      return true;
    });
    
    try {
      const status = await checkNetworkConnectivity();
      setConnectionStatus(prevStatus => {
        // Only update if status actually changed
        return prevStatus !== status ? status : prevStatus;
      });
    } catch (error) {
      console.warn('Network connectivity check failed:', error);
      setConnectionStatus('offline');
    } finally {
      setIsChecking(false);
    }
  }, [checkNetworkConnectivity]);

  useEffect(() => {
    let mounted = true;

    const performInitialCheck = async () => {
      if (!mounted) return;
      await performConnectivityCheck();
    };

    // Initial check
    performInitialCheck();

    const handleOnline = async () => {
      if (!mounted) return;
      // Don't immediately set to 'online' - let performConnectivityCheck determine the actual status
      await performConnectivityCheck();
    };

    const handleOffline = () => {
      if (!mounted) return;
      setConnectionStatus('offline');
    };

    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity checks every 30 seconds
    intervalRef.current = setInterval(() => {
      if (mounted) {
        performConnectivityCheck();
      }
    }, 30000);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array

  return {
    connectionStatus,
    isChecking,
    // Legacy support - returns boolean for backward compatibility
    isOnline: connectionStatus === 'online' || connectionStatus === 'slow',
    // Manual refresh function
    refresh: performConnectivityCheck
  };
}