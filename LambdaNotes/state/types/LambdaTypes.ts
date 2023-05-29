export type LambdaId = string;

/**
 * A Lambda represents a node in a hypergraph of interconnected concepts, or a "Lambda Lattice".
 * Each Lambda has a `value`, a unique `id`, a `depthFromRoot` indicating its position in a given projection,
 * and two arrays representing relationships with other Lambdas: `descriptions` and `connections`.
 *
 * The `descriptions` array consists of Lambdas that describe the current Lambda. Conversely, each describing Lambda lists the current Lambda in their `connections` array.
 *
 * The `connections` array comprises Lambdas that are "connected" to the current Lambda. Connections are bidirectional, forming a peer relationship between Lambdas.
 *
 * A Lambda is a dynamically generated, read-only entity. It provides a specific projection of the Lambda Lattice from the Lambda's perspective.
 *
 * The `depthFromRoot` property isn't inherent to a Lambda; it's dynamically computed based on the current perspective and traversal algorithm used during the projection of the lattice.
 *
 * Similarly, `descriptions` and `connections` are dynamically computed based on the current projection, and can change with different projections.
 *
 * Indirect cyclic relationships are inherent properties of the Lambda Lattice, mirroring the recursive nature of language and definitions.
 */
export interface Lambda {
  id: LambdaId;
  value: string;
  depthFromRoot: number;
  descriptions: Lambda[];
  connections: Lambda[];
}

/**
 * A LambdaAtom is a serialized, mutable version of a Lambda, designed for persistent storage.
 *
 * A LambdaAtom represents relationships (descriptions and connections) using LambdaIds instead of Lambdas.
 * Changes in the lattice structure occur at the LambdaAtom level, by modifying the `descriptions` and `connections` arrays.
 *
 * A LambdaAtom can be used to construct a Lambda by resolving the identifiers into their corresponding Lambdas.
 * The transition from a LambdaAtom to a Lambda involves generating a projection of the lattice from the LambdaAtom's perspective.
 */
export interface LambdaAtom {
  id: LambdaId;
  value: string;
  descriptions: LambdaId[];
  connections: LambdaId[];
}

/**
 * A VirtualLambdaAtom is a special kind of LambdaAtom that can dictate custom projection behavior.
 * It provides a 'customTraversal' function that can replace the currently scoped projection function,
 * enabling the system to interpret the underlying LambdaAtom (referenced by 'baseId') in a different way.
 */
