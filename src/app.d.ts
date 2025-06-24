// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

/**
 * A selector for targeting content within an XML document.
 */
export interface XPathSelector {
  selector: string;
  ns?: Record<string, string>;
}

/**
 * A selector for targeting content within a JSON document.
 */
export interface JSONPathSelector {
  selector: string;
  options?: {
    ignoreCase?: boolean;
    multiline?: boolean;
  };
}

/**
 * A generic predicate operator that defines the matching rule.
 */
type PredicateOperator =
  | { equals: object }
  | { deepEquals: object }
  | { contains: object }
  | { startsWith: object }
  | { endsWith: object }
  | { matches: object }
  | { exists: object }
  | { not: Predicate }
  | { inject: string };

/**
 * Defines the conditions under which a stub will match a request.
 * It combines a single predicate operator with optional modifier fields.
 */
export type Predicate = PredicateOperator & {
  caseSensitive?: boolean;
  except?: string;
  xpath?: XPathSelector;
  jsonpath?: JSONPathSelector;
};

// --- Response Behaviors ---

/**
 * Wait for a specified duration (in ms) or use a JavaScript function to determine the wait time.
 */
export interface WaitBehavior {
  wait: number | string;
}

/**
 * Use a JavaScript function to dynamically change the response before sending it.
 */
export interface DecorateBehavior {
  decorate: string;
}

/**
 * Transform the response using an external shell command.
 */
export interface ShellTransformBehavior {
  shellTransform: string;
}

/**
 * Copies a value from the request into the response using a specified selection method.
 */
export interface CopyBehavior {
  copy: {
    from: string | object;
    into: string;
    using: {
      method: "regex" | "xpath" | "jsonpath";
      selector: string;
    };
  };
}

/**
 * Looks up data from an external source (like a CSV) to enrich the response.
 */
export interface LookupBehavior {
  lookup: {
    key: {
      from: string | object;
      using: {
        method: "regex" | "xpath" | "jsonpath";
        selector: string;
      };
      index?: number;
    };
    fromDataSource: {
      csv?: {
        path: string;
        keyColumn: string;
        delimiter?: string;
      };
      json?: {
        path: string;
        datapath: string;
      };
    };
    into: string;
  };
}

/**
 * A union of all possible response behaviors.
 */
export type Behavior =
  | WaitBehavior
  | DecorateBehavior
  | ShellTransformBehavior
  | CopyBehavior
  | LookupBehavior;

// --- Response Types ---

/**
 * Defines a canned response with a status code, headers, and body.
 */
export interface IsResponse {
  is: {
    statusCode?: number;
    headers?: Record<string, string>;
    body?: any;
    _mode?: "text" | "binary";
  };
}

/**
 * Defines a proxy that forwards the request to another downstream service.
 */
export interface ProxyResponse {
  proxy: {
    to: string;
    mode?: "proxyOnce" | "proxyAlways" | "proxyTransparent";
    predicateGenerators?: object[];
    key?: string;
    cert?: string;
    passphrase?: string;
    ciphers?: string;
    secureProtocol?: string;
    addWaitBehavior?: boolean;
    addDecorateBehavior?: string;
    injectHeaders?: Record<string, string>;
  };
}

/**
 * Uses a JavaScript function to dynamically create the entire response.
 */
export interface InjectResponse {
  inject: string;
}

/**
 * Simulates a network fault.
 */
export interface FaultResponse {
  fault: "CONNECTION_RESET_BY_PEER" | "RANDOM_DATA_THEN_CLOSE";
}

/**
 * A single response object, combining one of the core response types
 * with optional common properties like 'repeat' and 'behaviors'.
 */
export type Response = (
  | IsResponse
  | ProxyResponse
  | InjectResponse
  | FaultResponse
) & {
  repeat?: number;
  behaviors?: Behavior[];
};

// --- Core Stub & Imposter Types ---

/**
 * A Mountebank stub, which defines a set of predicates to match against
 * and a list of responses to serve.
 */
export interface Stub {
  predicates?: Predicate[];
  responses: [Response, ...Response[]]; // Ensures at least one response
}

/**
 * The top-level Mountebank Imposter configuration.
 */
export interface Imposter {
  port: number;
  protocol: "http" | "https" | "tcp" | "smtp";
  name?: string;
  recordRequests?: boolean;
  allowCORS?: boolean;
  defaultResponse?: IsResponse["is"];
  stubs: Stub[];
}

export {};
