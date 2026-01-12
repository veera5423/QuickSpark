import { useState, useEffect, useCallback } from 'react';

// Circuit breaker states
const CIRCUIT_STATES = {
  CLOSED: 'closed',     // Normal operation
  OPEN: 'open',         // Service is failing, requests blocked
  HALF_OPEN: 'half_open' // Testing if service recovered
};

// Hook for circuit breaker pattern
export const useCircuitBreaker = (serviceName, options = {}) => {
  const {
    failureThreshold = 3,    // Number of failures before opening circuit
    recoveryTimeout = 30000, // Time to wait before trying again (30 seconds)
    successThreshold = 2     // Number of successes needed to close circuit
  } = options;

  const [state, setState] = useState(CIRCUIT_STATES.CLOSED);
  const [failures, setFailures] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState(null);
  const [lastSuccessTime, setLastSuccessTime] = useState(null);

  // Check if we should attempt recovery
  const shouldAttemptRecovery = useCallback(() => {
    if (state !== CIRCUIT_STATES.OPEN) return true;

    const timeSinceLastFailure = Date.now() - (lastFailureTime || 0);
    return timeSinceLastFailure >= recoveryTimeout;
  }, [state, lastFailureTime, recoveryTimeout]);

  // Record a successful request
  const recordSuccess = useCallback(() => {
    setLastSuccessTime(Date.now());

    if (state === CIRCUIT_STATES.HALF_OPEN) {
      setSuccesses(prev => {
        const newSuccesses = prev + 1;
        if (newSuccesses >= successThreshold) {
          setState(CIRCUIT_STATES.CLOSED);
          setFailures(0);
          setSuccesses(0);
          console.log(`${serviceName}: Circuit closed - service recovered`);
        }
        return newSuccesses;
      });
    } else {
      setFailures(0); // Reset failure count on success
    }
  }, [state, successThreshold, serviceName]);

  // Record a failed request
  const recordFailure = useCallback(() => {
    setLastFailureTime(Date.now());
    setSuccesses(0); // Reset success count

    setFailures(prev => {
      const newFailures = prev + 1;

      if (newFailures >= failureThreshold) {
        setState(CIRCUIT_STATES.OPEN);
        console.warn(`${serviceName}: Circuit opened - service failing`);
      }

      return newFailures;
    });
  }, [failureThreshold, serviceName]);

  // Execute a request with circuit breaker logic
  const execute = useCallback(async (requestFn) => {
    // If circuit is open and we shouldn't attempt recovery
    if (state === CIRCUIT_STATES.OPEN && !shouldAttemptRecovery()) {
      throw new Error(`${serviceName} is currently unavailable (circuit open)`);
    }

    // If circuit is open but we're attempting recovery
    if (state === CIRCUIT_STATES.OPEN && shouldAttemptRecovery()) {
      setState(CIRCUIT_STATES.HALF_OPEN);
      console.log(`${serviceName}: Testing service recovery...`);
    }

    try {
      const result = await requestFn();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }, [state, shouldAttemptRecovery, recordSuccess, recordFailure, serviceName]);

  // Get current status
  const getStatus = useCallback(() => ({
    state,
    failures,
    successes,
    isAvailable: state === CIRCUIT_STATES.CLOSED ||
                 (state === CIRCUIT_STATES.HALF_OPEN) ||
                 (state === CIRCUIT_STATES.OPEN && shouldAttemptRecovery()),
    lastFailureTime,
    lastSuccessTime
  }), [state, failures, successes, shouldAttemptRecovery, lastFailureTime, lastSuccessTime]);

  // Manual reset (for admin override)
  const reset = useCallback(() => {
    setState(CIRCUIT_STATES.CLOSED);
    setFailures(0);
    setSuccesses(0);
    setLastFailureTime(null);
    setLastSuccessTime(null);
    console.log(`${serviceName}: Circuit manually reset`);
  }, [serviceName]);

  return {
    execute,
    getStatus,
    reset,
    recordSuccess,
    recordFailure
  };
};

// Hook for service health monitoring
export const useServiceHealth = (services) => {
  const [healthStatus, setHealthStatus] = useState({});

  const updateServiceHealth = useCallback((serviceName, isHealthy) => {
    setHealthStatus(prev => ({
      ...prev,
      [serviceName]: {
        healthy: isHealthy,
        lastChecked: Date.now(),
        ...prev[serviceName]
      }
    }));
  }, []);

  const checkServiceHealth = useCallback(async (serviceName, healthCheckFn) => {
    try {
      await healthCheckFn();
      updateServiceHealth(serviceName, true);
      return true;
    } catch (error) {
      updateServiceHealth(serviceName, false);
      return false;
    }
  }, [updateServiceHealth]);

  // Initialize health status for all services
  useEffect(() => {
    const initialStatus = {};
    services.forEach(service => {
      initialStatus[service] = { healthy: true, lastChecked: null };
    });
    setHealthStatus(initialStatus);
  }, [services]);

  return {
    healthStatus,
    updateServiceHealth,
    checkServiceHealth
  };
};