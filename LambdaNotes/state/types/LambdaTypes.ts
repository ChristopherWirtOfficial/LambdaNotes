export type LambdaId = string;

// This is the type for a successful projection of a Lambda into a projected Lattice
// This is the lambda "fully realized" in the projection given. This is the semi-directed graph version of the lambda.
export interface Lambda {
  id: LambdaId;
  value: string;
  depth: number; // The depth in the given projection of this lambda (only availalbe in a projection, any lattice can be seen as "root")
  descriptions: Lambda[]; // descriptions Lambdas see this lambda in their `connections` array, but not vice versa
  connections: Lambda[]; // siblings or peers, effectively. More abstract.
}

// The actual version of the lambda that isn't recursively defined, and can actually be serialized and stored.
export interface LambdaAtom {
  id: LambdaId;
  value: string;
  // depth?: number; // Leaving out for now because it only caused confusion about what it was for
  descriptions: LambdaId[]; // ids of descriptions Lambdas
  connections: LambdaId[]; // ids of connected Lambdas
}
