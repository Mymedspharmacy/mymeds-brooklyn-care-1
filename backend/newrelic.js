'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['MyMeds Pharmacy Backend'],
  
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your-license-key-here',
  
  /**
   * This setting controls distributed tracing.
   * Distributed tracing lets you see the path that a request takes through your
   * distributed system. Enabling distributed tracing changes the behavior of some
   * New Relic features, so carefully consult the transition guide before you enable
   * this feature: https://docs.newrelic.com/docs/transition-guide-distributed-tracing
   * Default is true.
   */
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     *
     * @env NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
     */
    enabled: true
  },
  
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a
   * destination's attributes include/exclude lists.
   */
  allow_all_headers: true,
  
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end of attribute name.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  
  /**
   * Transaction tracer enables deep instrumentation of Express routes and
   * middleware.
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 5,
    record_sql: 'obfuscated',
    stack_trace_threshold: 0.5,
    explain_threshold: 0.5
  },
  
  /**
   * Error collector captures information about errors that occur in your
   * application.
   */
  error_collector: {
    enabled: true,
    collect_errors: true,
    ignore_status_codes: [404, 401, 403]
  },
  
  /**
   * Slow SQL queries can be automatically captured by the agent.
   */
  slow_sql: {
    enabled: true,
    max_samples: 5
  },
  
  /**
   * Browser monitoring gives you insight into the performance and errors
   * occurring in your users' browsers.
   */
  browser_monitoring: {
    enabled: false
  },
  
  /**
   * Host display name.
   */
  host_display_name: process.env.NEW_RELIC_HOST_DISPLAY_NAME || 'MyMeds Pharmacy Backend',
  
  /**
   * Application logging allows you to send your application logs to New Relic.
   */
  application_logging: {
    forwarding: {
      /**
       * Toggles whether the agent gathers log records for sending to New Relic.
       */
      enabled: true
    }
  },
  
  /**
   * Custom instrumentation for specific modules
   */
  custom_instrumentation: {
    enabled: true
  },
  
  /**
   * Security settings
   */
  security: {
    /**
     * Controls whether the agent collects security-related data.
     */
    enabled: true
  },
  
  /**
   * Distributed tracing settings
   */
  distributed_tracing: {
    enabled: true,
    exclude_newrelic_header: false
  },
  
  /**
   * Infinite tracing settings
   */
  infinite_tracing: {
    span_events: {
      queue_size: 10000
    }
  },
  
  /**
   * Logging level for the agent
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info'
  },
  
  /**
   * Proxy settings if needed
   */
  proxy: {
    enabled: false,
    host: process.env.NEW_RELIC_PROXY_HOST,
    port: process.env.NEW_RELIC_PROXY_PORT
  },
  
  /**
   * SSL settings
   */
  ssl: true,
  
  /**
   * Transaction naming
   */
  transaction_naming: {
    precedence: ['WebTransactionCustom', 'WebTransactionUri']
  }
};




