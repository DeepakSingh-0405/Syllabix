/**
 * Comprehensive In-Memory Academic Curriculum Knowledge Base for Core CS Courses
 * Provides syllabus outlines, structured units, definitions, mathematical formulations,
 * exam preparation strategies, and pre-formulated assessments for Syllabix AI.
 */

export interface CurriculumDefinition {
  term: string;
  definition: string;
}

export interface CurriculumUnit {
  unitNumber: number;
  unit: string;
  title: string;
  weightage: string;
  topics: string[];
  coreTopics: string[];
  definitions: CurriculumDefinition[];
  formulasOrInvariants: string[];
  coreFormulasOrPrinciples: string[];
  highYieldConcepts: string[];
}

export interface CurriculumQuizItem {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CurriculumFlashcardItem {
  front: string;
  back: string;
  sourceRef: string;
}

export interface SubjectCurriculum {
  code: string;
  name: string;
  aliases: string[];
  semester: number;
  credits: number;
  description: string;
  units: CurriculumUnit[];
  examPrepTips: string[];
  sampleQuestions: CurriculumQuizItem[];
  sampleFlashcards: CurriculumFlashcardItem[];
}

export const CURRICULUM_DATA: Record<string, SubjectCurriculum> = {
  'CS-201': {
    code: 'CS-201',
    name: 'Data Structures & Algorithms',
    aliases: ['dsa', 'data structures', 'algorithms', 'cs201'],
    semester: 3,
    credits: 4,
    description: 'Comprehensive study of linear and non-linear data structures, asymptotic notation, algorithm design paradigms, graph algorithms, and NP-completeness.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Asymptotic Analysis & Linear Data Structures',
        title: 'Asymptotic Analysis & Linear Data Structures',
        weightage: '20%',
        topics: [
          'Asymptotic Notations (Big-O, Big-Omega, Big-Theta)',
          'Amortized Analysis (Aggregate, Accounting, Potential method)',
          'Singly, Doubly, and Circular Linked Lists',
          'Stack Implementations & Applications (Infix to Postfix, Parenthesis Matching)',
          'Queues, Circular Queues, and Double-Ended Queues (Deque)',
        ],
        coreTopics: ['Asymptotic Complexity', 'Amortized Analysis', 'Linked Lists', 'Stacks & Infix/Postfix', 'Circular Queues'],
        definitions: [
          {
            term: 'Big-O Notation',
            definition: 'Formal mathematical definition: f(n) = O(g(n)) if there exist positive constants c and n0 such that 0 <= f(n) <= c*g(n) for all n >= n0. Represents an asymptotic upper bound.',
          },
          {
            term: 'Amortized Time Complexity',
            definition: 'The average time taken per operation over a worst-case sequence of operations, guaranteeing that total sequence cost is bounded even if occasional operations are expensive.',
          },
          {
            term: 'Circular Queue',
            definition: 'A linear data structure using a fixed-size buffer with front and rear pointers wrapping around using modulo arithmetic ((rear + 1) % capacity) to eliminate queue drift.',
          },
        ],
        formulasOrInvariants: [
          'Big-O condition: 0 <= f(n) <= c * g(n) for n >= n0',
          'Circular Queue wrap-around: rear = (rear + 1) % MAX_SIZE',
          'Dynamic Array doubling amortized cost: T(n) = 3n -> O(1) amortized insertion',
        ],
        coreFormulasOrPrinciples: ['f(n) <= c * g(n)', 'rear = (rear + 1) % N', 'Amortized doubling O(1)'],
        highYieldConcepts: ['Mastering Infix to Postfix with operator precedence stack', 'Two-pointer technique for linked list cycle detection (Floyd Cycle Finding)'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: Hierarchical Data Structures: Trees & Heaps',
        title: 'Hierarchical Data Structures: Trees & Heaps',
        weightage: '20%',
        topics: [
          'Binary Trees and Tree Traversals (Inorder, Preorder, Postorder, Level-Order)',
          'Binary Search Trees (BST) Insertion, Deletion, and Successor/Predecessor',
          'AVL Trees: Balance Factor, Single & Double Rotations (LL, RR, LR, RL)',
          'Red-Black Trees Properties & Color Flipping',
          'Binary Heaps (Min/Max Heap), Heapify Operation, and Priority Queues',
        ],
        coreTopics: ['Tree Traversals', 'BST Operations', 'AVL Tree Rotations', 'Red-Black Tree Properties', 'Binary Heap & Heapify'],
        definitions: [
          {
            term: 'AVL Tree Balance Factor',
            definition: 'The difference between the heights of the left and right subtrees: BF(node) = Height(Left) - Height(Right). An AVL tree maintains |BF(node)| <= 1 for every node.',
          },
          {
            term: 'Heap Invariant',
            definition: 'In a Max Heap, for any given node i, the key of i is greater than or equal to the keys of its children: A[Parent(i)] >= A[i]. A binary heap is always a complete binary tree.',
          },
        ],
        formulasOrInvariants: [
          'AVL Balance Factor: BF(v) = height(left) - height(right) in {-1, 0, 1}',
          'Heap child indexing (0-based): Left = 2i + 1, Right = 2i + 2, Parent = floor((i - 1) / 2)',
          'Build-Heap time complexity: Sum from h=0 to log n of (n / 2^(h+1)) * O(h) = O(n)',
        ],
        coreFormulasOrPrinciples: ['|height(L) - height(R)| <= 1', 'Parent(i) = floor((i-1)/2)', 'Build-Heap: O(n)'],
        highYieldConcepts: ['AVL double rotations (LR and RL) step-by-step', 'Inorder traversal of BST produces strictly sorted order'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Graph Theory & Shortest Path Algorithms',
        title: 'Graph Theory & Shortest Path Algorithms',
        weightage: '20%',
        topics: [
          'Graph Representations: Adjacency Matrix vs Adjacency List',
          'Breadth-First Search (BFS) and Depth-First Search (DFS) with Classification of Edges',
          'Topological Sorting (Kahn’s Algorithm & DFS Postorder)',
          'Single Source Shortest Path: Dijkstra’s Algorithm & Bellman-Ford Algorithm',
          'Minimum Spanning Trees: Kruskal’s Algorithm (Disjoint Set Union) and Prim’s Algorithm',
        ],
        coreTopics: ['Graph Traversals (BFS/DFS)', 'Topological Sort', 'Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'MST (Prim & Kruskal)'],
        definitions: [
          {
            term: 'Dijkstra’s Algorithm',
            definition: 'Greedy single-source shortest path algorithm for graphs with non-negative edge weights. Operates in O((V + E) log V) using a min-priority queue.',
          },
          {
            term: 'Bellman-Ford Algorithm',
            definition: 'Dynamic programming shortest path algorithm that relaxes all edges |V| - 1 times, capable of handling negative weights and detecting negative weight cycles in O(V * E) time.',
          },
          {
            term: 'Disjoint Set Union (Union-Find)',
            definition: 'Data structure tracking partitioned sets with Near-constant O(alpha(n)) amortized time per operation using path compression and union by rank.',
          },
        ],
        formulasOrInvariants: [
          'Edge relaxation condition: if (dist[u] + weight(u, v) < dist[v]) { dist[v] = dist[u] + weight(u, v); }',
          'Bellman-Ford negative cycle test: if dist[u] + weight(u, v) < dist[v] on V-th iteration, cycle exists',
          'Euler’s Formula for planar connected graphs: V - E + F = 2',
        ],
        coreFormulasOrPrinciples: ['dist[v] = min(dist[v], dist[u] + w(u,v))', 'V - 1 relaxation iterations', 'Ackermann inverse alpha(n)'],
        highYieldConcepts: ['Why Dijkstra fails with negative weights', 'Disjoint Set Union rank and path compression mechanics in Kruskal'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Algorithm Design Techniques: Divide & Conquer and Dynamic Programming',
        title: 'Algorithm Design Techniques: Divide & Conquer and Dynamic Programming',
        weightage: '20%',
        topics: [
          'Divide and Conquer Paradigm: MergeSort, QuickSort, and Randomized Selection',
          'Master Theorem for Recurrence Relations',
          'Dynamic Programming: Memoization vs Tabulation, Optimal Substructure, Overlapping Subproblems',
          'Classic DP Problems: 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication',
          'Greedy Strategy: Fractional Knapsack, Huffman Coding, Activity Selection',
        ],
        coreTopics: ['Divide & Conquer', 'Master Theorem', 'Dynamic Programming Principles', '0/1 Knapsack & LCS', 'Greedy Algorithms'],
        definitions: [
          {
            term: 'Master Theorem',
            definition: 'Provides asymptotic bounds for recurrences of the form T(n) = a*T(n/b) + f(n), comparing f(n) with n^(log_b a) across three standard cases.',
          },
          {
            term: 'Optimal Substructure',
            definition: 'A problem exhibits optimal substructure if an optimal solution to the problem contains within it optimal solutions to subproblems.',
          },
          {
            term: '0/1 Knapsack Problem',
            definition: 'DP optimization choosing items with weights and values to maximize total value without exceeding capacity W. Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i]).',
          },
        ],
        formulasOrInvariants: [
          'Master Theorem: T(n) = a*T(n/b) + Theta(n^d). If d < log_b a -> Theta(n^(log_b a)); If d = log_b a -> Theta(n^d * log n); If d > log_b a -> Theta(n^d)',
          'LCS Recurrence: if (X[i] == Y[j]) c[i,j] = c[i-1,j-1] + 1; else c[i,j] = max(c[i-1,j], c[i,j-1])',
          'Matrix Chain Multiplication: m[i,j] = min_{i<=k<j} (m[i,k] + m[k+1,j] + p_{i-1} * p_k * p_j)',
        ],
        coreFormulasOrPrinciples: ['T(n) = a*T(n/b) + f(n)', 'dp[i][w] = max(not_take, take)', 'Huffman tree prefix code optimality'],
        highYieldConcepts: ['Master theorem edge cases (when f(n) is polynomial vs non-polynomial)', 'Reconstructing optimal paths in DP tables'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Hashing, String Matching & Complexity Classes',
        title: 'Hashing, String Matching & Complexity Classes',
        weightage: '20%',
        topics: [
          'Hash Tables: Hash Functions, Separate Chaining, Open Addressing (Linear Probing, Quadratic, Double Hashing)',
          'String Matching Algorithms: Knuth-Morris-Pratt (KMP) & Prefix Function (pi-table), Rabin-Karp',
          'Tries & Suffix Trees for Prefix Lookups',
          'Complexity Classes: P, NP, NP-Complete, and NP-Hard',
          'Cook-Levin Theorem and Polynomial-Time Reductions (3-SAT to Clique, Vertex Cover)',
        ],
        coreTopics: ['Hash Functions & Collisions', 'KMP String Matching', 'Trie Data Structure', 'P vs NP Concepts', 'Polynomial Reductions'],
        definitions: [
          {
            term: 'KMP Prefix Function (pi array)',
            definition: 'pi[q] stores the length of the longest proper prefix of P[1..q] that is also a suffix of P[1..q]. Allows the matcher to skip redundant comparisons in O(n + m) time.',
          },
          {
            term: 'NP-Completeness',
            definition: 'A decision problem L is NP-Complete if: (1) L is in NP (verifiable in polynomial time), and (2) Every problem in NP is polynomial-time reducible to L (L is NP-hard).',
          },
        ],
        formulasOrInvariants: [
          'Hash Load Factor: alpha = n / m (items / buckets)',
          'Open Addressing expected probes for unsuccessful search: 1 / (1 - alpha)',
          'Polynomial-time reduction condition: A <=_p B means x in A iff f(x) in B where f runs in poly-time',
        ],
        coreFormulasOrPrinciples: ['alpha = n / m', 'KMP Time: O(n + m)', 'L in NP-Complete <=> L in NP and NP-Hard'],
        highYieldConcepts: ['Calculating KMP failure function pi table step-by-step', 'Proving a problem is NP-complete by reducing from 3-SAT'],
      },
    ],
    examPrepTips: [
      'Always state asymptotic base cases and loop invariants explicitly in algorithm proofs.',
      'For Dynamic Programming questions, write both the mathematical recurrence relation and the 2D state transition table dimensions.',
      'Show the exact steps of AVL tree rotations (indicating the pivot and nodes being relinked) to score full marks.',
      'Distinguish clearly between O(V + E) for adjacency list representations and O(V^2) for adjacency matrix representations in graph questions.',
    ],
    sampleQuestions: [
      {
        id: 'q-dsa-1',
        type: 'mcq',
        question: 'What is the tightest worst-case time complexity of searching for an element in an AVL tree containing n nodes?',
        options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'Because an AVL tree strictly enforces that the height difference between left and right subtrees is at most 1, its height is strictly bounded by 1.44 * log2(n), guaranteeing O(log n) worst-case search time.',
      },
      {
        id: 'q-dsa-2',
        type: 'mcq',
        question: 'Which algorithm is capable of computing single-source shortest paths on a directed graph with negative edge weights and detecting negative-weight cycles?',
        options: ['Bellman-Ford Algorithm', 'Dijkstra’s Algorithm with Min-Heap', 'Prim’s Algorithm', 'Floyd-Warshall (all-pairs only)'],
        correctIndex: 0,
        explanation: 'The Bellman-Ford algorithm relaxes all |E| edges |V| - 1 times. A subsequent |V|-th iteration that yields further relaxation indicates the presence of a reachable negative-weight cycle.',
      },
      {
        id: 'q-dsa-3',
        type: 'mcq',
        question: 'According to the Master Theorem, what is the asymptotic solution to the recurrence T(n) = 2T(n/2) + Theta(n)?',
        options: ['Theta(n log n)', 'Theta(n)', 'Theta(n^2)', 'Theta(log n)'],
        correctIndex: 0,
        explanation: 'Here a = 2, b = 2, and f(n) = Theta(n). Since log_b(a) = log_2(2) = 1, and f(n) = Theta(n^1), this corresponds to Case 2 of the Master Theorem, yielding T(n) = Theta(n log n).',
      },
      {
        id: 'q-dsa-4',
        type: 'mcq',
        question: 'What is the expected number of probes in an open addressing hash table with uniform hashing and load factor alpha?',
        options: ['1 / (1 - alpha) for unsuccessful search', '1 / alpha', 'alpha * log(n)', 'Constant 1'],
        correctIndex: 0,
        explanation: 'Under uniform hashing in open addressing, the expected number of probes in an unsuccessful search is bounded by 1 / (1 - alpha), where alpha = n / m < 1.',
      },
      {
        id: 'q-dsa-5',
        type: 'mcq',
        question: 'In the 0/1 Knapsack problem with n items and capacity W, why is the dynamic programming algorithm categorized as pseudo-polynomial time?',
        options: [
          'Its time complexity O(n*W) depends linearly on the numeric value of W, which is exponential in the input length (log2 W bits)',
          'It only works for fractional items',
          'It requires non-deterministic polynomial reductions',
          'Its space complexity cannot be optimized to 1D',
        ],
        correctIndex: 0,
        explanation: 'The running time O(n*W) is polynomial in the magnitude of W, but the input size to represent numeric value W is only ceil(log2 W) bits. Thus, the runtime is exponential with respect to the input length of the number W (2^k where k = log2 W), classifying it as pseudo-polynomial.',
      },
    ],
    sampleFlashcards: [
      {
        front: 'What is the worst-case time complexity of QuickSort, and under what condition does it occur?',
        back: 'O(n^2). It occurs when the pivot chosen is consistently the extreme element (minimum or maximum), such as partitioning an already sorted array with the first or last element as pivot.',
        sourceRef: 'CS-201 — Unit 4: Divide & Conquer',
      },
      {
        front: 'State the AVL Tree Balance Factor invariant and the 4 rotation cases.',
        back: 'Invariant: |height(left) - height(right)| <= 1 for all nodes. Rotations: Left-Left (Single Right Rotation), Right-Right (Single Left Rotation), Left-Right (Left rotation on child then Right on node), Right-Left (Right rotation on child then Left on node).',
        sourceRef: 'CS-201 — Unit 2: Hierarchical Data Structures',
      },
      {
        front: 'Why does Dijkstra’s algorithm fail to produce correct shortest paths on graphs with negative edge weights?',
        back: 'Dijkstra assumes that once a vertex is extracted from the priority queue and added to the finalized set S, its shortest path distance is permanently determined. A negative edge encountered later could provide a shorter path to an already finalized vertex, violating the greedy choice property.',
        sourceRef: 'CS-201 — Unit 3: Graph Theory',
      },
      {
        front: 'Explain the difference between Memoization (Top-Down) and Tabulation (Bottom-Up) in Dynamic Programming.',
        back: 'Memoization is top-down recursion that caches subproblem results in a hash table or array upon return. Tabulation is bottom-up iterative calculation that fills a DP table starting from base cases, eliminating function call stack overhead.',
        sourceRef: 'CS-201 — Unit 4: Dynamic Programming',
      },
      {
        front: 'Define NP-Complete and explain how to prove a new problem X is NP-Complete.',
        back: 'A problem X is NP-Complete if: (1) X is in NP (a certificate can be verified in polynomial time), and (2) X is NP-Hard (a known NP-Complete problem Y can be reduced to X in polynomial time, Y <=_p X).',
        sourceRef: 'CS-201 — Unit 5: Complexity Classes',
      },
    ],
  },

  'CS-202': {
    code: 'CS-202',
    name: 'Object-Oriented Programming (Java/C++)',
    aliases: ['oop', 'oops', 'object oriented programming', 'java', 'c++', 'cs202'],
    semester: 4,
    credits: 4,
    description: 'Foundations of object-oriented design, encapsulation, polymorphism, inheritance, virtual tables, exception handling, templates/generics, and design patterns.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Paradigms, Abstraction & Encapsulation',
        title: 'Paradigms, Abstraction & Encapsulation',
        weightage: '20%',
        topics: [
          'Procedural vs Object-Oriented Programming Paradigms',
          'Classes, Objects, State and Behavior',
          'Access Specifiers (private, protected, public, package-private)',
          'Constructors, Copy Constructors, Destructors, and this/super Keywords',
          'Memory Layout of Objects: Stack vs Heap, Static Members, Garbage Collection Mechanics',
        ],
        coreTopics: ['OOP Paradigms', 'Encapsulation & Access', 'Constructors & Destructors', 'Memory Allocation', 'Static Members'],
        definitions: [
          {
            term: 'Encapsulation',
            definition: 'Bundling data attributes and the methods that operate on them into a single unit (class) while restricting direct outside access via private access modifiers to maintain invariant integrity.',
          },
          {
            term: 'Copy Constructor',
            definition: 'A member function that initializes an object using another object of the same class. In C++, deep copies must duplicate dynamically allocated heap memory to avoid double-free errors.',
          },
        ],
        formulasOrInvariants: [
          'Encapsulation invariant: Internal state mutated only through public/protected methods validating preconditions',
          'C++ Rule of Three/Five: If a class defines destructor, copy constructor, or copy assignment operator, it likely must define all three (or five including move semantics)',
        ],
        coreFormulasOrPrinciples: ['Encapsulation invariant', 'Rule of 3 / Rule of 5', 'Stack vs Heap lifetime'],
        highYieldConcepts: ['Shallow copy vs Deep copy memory pitfalls', 'Static members shared across all class instances'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: Inheritance & Polymorphism',
        title: 'Inheritance & Polymorphism',
        weightage: '20%',
        topics: [
          'Inheritance Hierarchies: Single, Multilevel, Multiple, and Hierarchical',
          'The Diamond Problem in Multiple Inheritance and Virtual Base Classes',
          'Compile-Time Polymorphism: Function Overloading and Operator Overloading',
          'Run-Time Polymorphism: Method Overriding and Dynamic Method Dispatch',
          'Virtual Functions, Pure Virtual Functions, and Virtual Method Table (vtable/vptr)',
        ],
        coreTopics: ['Inheritance Types', 'Diamond Problem', 'Overloading vs Overriding', 'Virtual Functions', 'vtable & vptr Architecture'],
        definitions: [
          {
            term: 'Virtual Method Table (vtable)',
            definition: 'A table of function pointers created by the compiler for classes containing virtual functions. Each object instance stores an internal hidden pointer (vptr) pointing to this table for dynamic dispatch.',
          },
          {
            term: 'Diamond Problem',
            definition: 'Ambiguity arising in multiple inheritance when a class inherits from two classes that both inherit from a single common ancestor. Resolved in C++ using virtual inheritance.',
          },
        ],
        formulasOrInvariants: [
          'Dynamic Dispatch: obj->vptr[method_index](obj, args...) resolved at runtime',
          'Virtual Inheritance invariant: Guarantees only one shared instance of the grandparent base class exists',
        ],
        coreFormulasOrPrinciples: ['vtable function pointer table', 'vptr object overhead', 'virtual base class'],
        highYieldConcepts: ['Why destructors in base classes must be virtual', 'Overriding requires identical signature and return type (or covariant return)'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Interfaces, Abstract Classes & SOLID Principles',
        title: 'Interfaces, Abstract Classes & SOLID Principles',
        weightage: '20%',
        topics: [
          'Abstract Classes vs Interfaces: Contracts, Default Methods, and Multiple Realization',
          'Single Responsibility Principle (SRP) and Open/Closed Principle (OCP)',
          'Liskov Substitution Principle (LSP): Behavioral Subtyping and Precondition/Postcondition Rules',
          'Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)',
          'Coupling vs Cohesion in Software Architecture',
        ],
        coreTopics: ['Abstract Classes vs Interfaces', 'SRP & OCP', 'Liskov Substitution Principle', 'ISP & Dependency Inversion', 'High Cohesion Low Coupling'],
        definitions: [
          {
            term: 'Liskov Substitution Principle (LSP)',
            definition: 'Objects of a superclass should be replaceable with objects of its subclasses without altering the correctness or desirable properties of the program.',
          },
          {
            term: 'Dependency Inversion Principle (DIP)',
            definition: 'High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.',
          },
        ],
        formulasOrInvariants: [
          'LSP Precondition/Postcondition Rule: Subtypes may weaken preconditions but cannot strengthen them; subtypes may strengthen postconditions but cannot weaken them',
          'High Cohesion + Loose Coupling = Robust Maintainability',
        ],
        coreFormulasOrPrinciples: ['LSP subtyping invariant', 'High Cohesion / Low Coupling', 'Depend on Abstractions (DIP)'],
        highYieldConcepts: ['Rectangle vs Square violation of LSP', 'Default and static methods in modern Java interfaces'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Exception Handling, Generics & Collections',
        title: 'Exception Handling, Generics & Collections',
        weightage: '20%',
        topics: [
          'Exception Hierarchy: Checked vs Unchecked Exceptions, try-catch-finally, try-with-resources',
          'Custom Exception Classes and Exception Propagation across the Call Stack',
          'Generics and Templates: Type Erasure, Wildcards (? extends T, ? super T), Invariance/Covariance',
          'Standard Collection Frameworks: List, Set, Map, Queue, PriorityQueue',
          'Lambda Expressions, Functional Interfaces, and Stream API Pipelines',
        ],
        coreTopics: ['Exception Mechanics', 'Checked vs Unchecked', 'Generics & Wildcards', 'Collections Framework', 'Lambdas & Streams'],
        definitions: [
          {
            term: 'Type Erasure',
            definition: 'The process in Java where generic type information is verified at compile-time and then removed (erased) from bytecode, replacing type parameters with their bounds (or Object) for backwards compatibility.',
          },
          {
            term: 'PECS Rule (Producer Extends, Consumer Super)',
            definition: 'Use <? extends T> when reading data from a generic structure (producer); use <? super T> when inserting/writing data into a generic structure (consumer).',
          },
        ],
        formulasOrInvariants: [
          'PECS Guideline: Producer Extends, Consumer Super',
          'try-with-resources: AutoCloseable guarantees close() invocation even under uncaught exceptions',
        ],
        coreFormulasOrPrinciples: ['<? extends T> for Reading', '<? super T> for Writing', 'AutoCloseable resource cleanup'],
        highYieldConcepts: ['Why finally block executes even if try block has a return statement', 'HashMap internal bucket collision handling (Linked List to Red-Black Tree in Java 8+)'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Design Patterns & Concurrency Basics',
        title: 'Design Patterns & Concurrency Basics',
        weightage: '20%',
        topics: [
          'Creational Patterns: Singleton (Thread-safe Double-Checked Locking), Factory Method, Abstract Factory',
          'Structural Patterns: Adapter, Decorator, Facade',
          'Behavioral Patterns: Observer, Strategy, Command',
          'Threads in Java/C++: Runnable, Thread Lifecycle, synchronized keyword, volatile variable semantics',
          'Deadlock Conditions in Multi-Threaded Object Systems and Thread Safety',
        ],
        coreTopics: ['Singleton & Factory Patterns', 'Adapter & Decorator', 'Observer & Strategy', 'Thread Synchronization', 'Volatile Semantics & Deadlocks'],
        definitions: [
          {
            term: 'Double-Checked Locking Singleton',
            definition: 'A design pattern minimizing synchronization overhead by checking instance == null before acquiring a monitor lock, requiring the instance reference to be declared volatile to prevent instruction reordering.',
          },
          {
            term: 'Strategy Pattern',
            definition: 'A behavioral design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime without modifying client classes.',
          },
        ],
        formulasOrInvariants: [
          'Volatile memory barrier: Guarantees visibility across CPU caches and prevents compiler instruction reordering',
          'Open/Closed in Strategy Pattern: Open for extension (add new Strategy implementation) but closed for modification (Context class unchanged)',
        ],
        coreFormulasOrPrinciples: ['volatile variable visibility', 'Double-checked lock synchronization', 'Composition over Inheritance'],
        highYieldConcepts: ['Thread-safe Singleton implementation in Java/C++', 'Decorator pattern dynamic wrapping vs static subclass explosion'],
      },
    ],
    examPrepTips: [
      'Always draw class diagrams indicating inheritance (solid line with open triangle) and realization/interface implementation (dashed line with open triangle).',
      'For polymorphism questions, trace the exact vptr dereference and write the function output step-by-step.',
      'Explain the memory layout (stack vs heap) and why virtual destructors are mandatory when deleting derived objects via base pointers.',
    ],
    sampleQuestions: [
      {
        id: 'q-oop-1',
        type: 'mcq',
        question: 'What is the primary purpose of making a base class destructor virtual in C++?',
        options: [
          'To ensure the derived class destructor is invoked when deleting an object through a base class pointer',
          'To prevent the base class from being instantiated',
          'To make all member variables private',
          'To allocate the object on the stack instead of heap',
        ],
        correctIndex: 0,
        explanation: 'If a derived class object is deleted through a base class pointer and the base destructor is not virtual, undefined behavior occurs (usually only the base destructor runs, causing resource leaks of derived members).',
      },
      {
        id: 'q-oop-2',
        type: 'mcq',
        question: 'Which SOLID principle is violated if a derived class overrides a base method with an empty implementation that throws an UnsupportedOperationException?',
        options: ['Liskov Substitution Principle (LSP)', 'Single Responsibility Principle (SRP)', 'Dependency Inversion Principle (DIP)', 'Open/Closed Principle (OCP)'],
        correctIndex: 0,
        explanation: 'LSP dictates that derived classes must be usable in place of their base classes without breaking client expectations. Throwing an unexpected exception breaks behavioral subtyping.',
      },
      {
        id: 'q-oop-3',
        type: 'mcq',
        question: 'Which design pattern is best suited for attaching additional responsibilities to an object dynamically at runtime without modifying the underlying class structure?',
        options: ['Decorator Pattern', 'Singleton Pattern', 'Factory Method Pattern', 'Observer Pattern'],
        correctIndex: 0,
        explanation: 'The Decorator pattern attaches additional responsibilities to an object dynamically by wrapping it with another class implementing the same interface, providing an alternative to subclassing for extending functionality.',
      },
      {
        id: 'q-oop-4',
        type: 'mcq',
        question: 'Under RAII (Resource Acquisition Is Initialization), when should acquired resources (such as heap memory, socket handles, or file descriptors) be released?',
        options: [
          'Automatically in the destructor of the resource-managing object when its enclosing scope ends',
          'Manually by calling an explicit free() or close() method at the end of main()',
          'During garbage collection invocation',
          'Only when an unhandled exception propagates to the top-level catch block',
        ],
        correctIndex: 0,
        explanation: 'RAII binds resource lifetime to object lifetime: resource acquisition occurs in the constructor, and guaranteed release occurs deterministically in the destructor during stack unwinding when leaving scope.',
      },
      {
        id: 'q-oop-5',
        type: 'mcq',
        question: 'In object-oriented design, what is the key difference between Composition and Aggregation?',
        options: [
          'In Composition, the child part cannot exist independently of the whole parent; in Aggregation, the child has an independent lifecycle',
          'Composition uses inheritance, whereas Aggregation uses interfaces',
          'Aggregation represents a strict "is-a" relationship, whereas Composition represents "can-do"',
          'There is no distinction; they are interchangeable terms in UML',
        ],
        correctIndex: 0,
        explanation: 'Composition is a strong "has-a" relationship where the parts are created and destroyed with the whole container (co-dependent lifecycle). Aggregation is a weak "has-a" association where child components exist independently (e.g. Students in a Course).',
      },
    ],
    sampleFlashcards: [
      {
        front: 'Explain how virtual method dispatch is implemented using vtable and vptr.',
        back: 'The compiler creates a static vtable for each class with virtual functions containing function pointers. Each object holds an internal hidden pointer (vptr) pointing to its class vtable. When a virtual function is called through a base pointer, the program indexes the vtable via vptr at runtime.',
        sourceRef: 'CS-202 — Unit 2: Inheritance & Polymorphism',
      },
      {
        front: 'What is the Diamond Problem in C++ and how is it resolved?',
        back: 'The Diamond Problem occurs when class D inherits from both B and C, which both inherit from A, causing two copies of A in D. It is resolved using virtual base inheritance (class B : virtual public A, class C : virtual public A), ensuring only one shared instance of A exists in D.',
        sourceRef: 'CS-202 — Unit 2: Inheritance & Polymorphism',
      },
    ],
  },

  'CS-203': {
    code: 'CS-203',
    name: 'Computer System Architecture',
    aliases: ['csa', 'computer organization', 'coa', 'architecture', 'cs203'],
    semester: 4,
    credits: 4,
    description: 'Hardware-software interface, instruction set architectures, processor pipelining, memory hierarchy, cache mapping, virtual memory, and I/O subsystems.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Register Transfer & Basic Computer Organization',
        title: 'Register Transfer & Basic Computer Organization',
        weightage: '20%',
        topics: [
          'Register Transfer Language (RTL) and Micro-operations (Arithmetic, Logic, Shift)',
          'Common Bus System: Multiplexer-based vs Tri-state Bus Buffers',
          'Instruction Codes, Computer Registers (PC, AR, DR, AC, IR, TR, INPR, OUTR)',
          'Timing and Control: Hardwired Control vs Microprogrammed Control Units',
          'Instruction Cycle: Fetch, Decode, Read Effective Address, and Execution Phases',
        ],
        coreTopics: ['Register Transfer Language', 'Bus Architectures', 'Computer Registers', 'Hardwired vs Microprogrammed Control', 'Instruction Cycle Phases'],
        definitions: [
          {
            term: 'Instruction Cycle',
            definition: 'The fundamental sequence of steps performed by the CPU for each machine instruction: Fetch (PC -> AR, Memory -> IR), Decode (IR opcode decoded), Execute, and check for Interrupts.',
          },
          {
            term: 'Microprogrammed Control Unit',
            definition: 'A control unit where control signals are generated by reading microinstructions from a control memory (ROM), offering flexibility and ease of modification over hardwired control.',
          },
        ],
        formulasOrInvariants: [
          'Instruction Cycle sequence: T0: AR <- PC; T1: IR <- M[AR], PC <- PC + 1; T2: Decode IR(12-14), AR <- IR(0-11), I <- IR(15)',
          'Multiplexer selection bits: k selection lines select from 2^k registers',
        ],
        coreFormulasOrPrinciples: ['Fetch -> Decode -> Execute', 'Multiplexer select lines: 2^k inputs require k bits', 'Control ROM sequencing'],
        highYieldConcepts: ['Microprogrammed control vs hardwired control trade-offs (speed vs flexibility)', 'Difference between direct and indirect addressing modes in opcode word'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: Instruction Set Architecture (ISA) & Arithmetic',
        title: 'Instruction Set Architecture (ISA) & Arithmetic',
        weightage: '20%',
        topics: [
          'Instruction Formats: Three-address, Two-address, One-address (Accumulator), and Zero-address (Stack)',
          'Addressing Modes: Immediate, Direct, Indirect, Register, Register Indirect, Indexed, Relative, Base-Register',
          'RISC (Reduced Instruction Set Computer) vs CISC (Complex Instruction Set Computer) Principles',
          'Computer Arithmetic: Booth’s Multiplication Algorithm for Signed Numbers',
          'Restoring and Non-Restoring Division Algorithms, IEEE 754 Floating-Point Format',
        ],
        coreTopics: ['Instruction Formats', 'Addressing Modes', 'RISC vs CISC', 'Booth Multiplication', 'IEEE 754 Floating Point'],
        definitions: [
          {
            term: 'Booth’s Multiplication Algorithm',
            definition: 'An algorithm multiplying two signed binary numbers in two’s complement representation by inspecting adjacent bit pairs (Q0, Q-1) to perform addition, subtraction, or arithmetic right shifts.',
          },
          {
            term: 'IEEE 754 Single-Precision Format',
            definition: 'A 32-bit floating point representation consisting of 1 sign bit, 8 exponent bits with bias 127, and 23 normalized mantissa (fraction) bits with an implicit leading 1.',
          },
        ],
        formulasOrInvariants: [
          'Booth’s decision table: 10 -> Subtract multiplicand and shift; 01 -> Add multiplicand and shift; 00 or 11 -> Shift only',
          'IEEE 754 single precision value: (-1)^S * (1.M) * 2^(E - 127)',
          'Effective Address (Indexed): EA = Base + Index_Register',
        ],
        coreFormulasOrPrinciples: ['Booth: inspect (Q0, Q-1)', 'IEEE 754: (-1)^s * (1.M) * 2^(E-127)', 'RISC: Single-cycle load/store'],
        highYieldConcepts: ['Booth’s algorithm step-by-step arithmetic shift right preserving sign bit', 'Zero-address instructions using Reverse Polish Notation (RPN) on evaluation stack'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Pipelining & Instruction-Level Parallelism',
        title: 'Pipelining & Instruction-Level Parallelism',
        weightage: '20%',
        topics: [
          'Basic Pipelining Concepts: Instruction Pipeline Stages (IF, ID, EX, MEM, WB)',
          'Pipeline Speedup, Throughput, and Efficiency Metrics',
          'Pipeline Hazards: Structural Hazards (Resource conflicts)',
          'Data Hazards: RAW (Read-After-Write), WAR, WAW, and Forwarding/Bypassing',
          'Control Hazards: Branch penalties, Delayed Branching, Static and Dynamic Branch Prediction',
        ],
        coreTopics: ['Pipeline Stages (5-stage)', 'Speedup & Throughput', 'Structural Hazards', 'Data Hazards & Forwarding', 'Control Hazards & Branch Prediction'],
        definitions: [
          {
            term: 'Data Hazard (RAW)',
            definition: 'A hazard occurring when an instruction depends on the result of a previous instruction that has not yet completed execution and write-back. Resolved via operand forwarding or stalls.',
          },
          {
            term: 'Pipeline Speedup',
            definition: 'The performance gain of a pipelined processor over a non-pipelined processor: Speedup = (n * k) / (k + n - 1), approaching k (number of stages) as the number of instructions n becomes large.',
          },
        ],
        formulasOrInvariants: [
          'Speedup S = (Time non-pipelined) / (Time pipelined) = (n * k * t) / ((k + n - 1) * t) -> k as n -> infinity',
          'Ideal CPI = 1.0; Actual CPI = CPI_ideal + Stall_cycles',
          'Throughput = n / ((k + n - 1) * clock_cycle_time)',
        ],
        coreFormulasOrPrinciples: ['S = (n * k) / (k + n - 1)', 'Actual CPI = 1 + Stalls', 'Forwarding resolves RAW without stalls'],
        highYieldConcepts: ['How operand forwarding bypasses the register file directly from EX/MEM stage', 'Branch penalty calculation and branch target buffer (BTB)'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Memory Hierarchy & Cache Design',
        title: 'Memory Hierarchy & Cache Design',
        weightage: '20%',
        topics: [
          'Memory Hierarchy Levels (Registers, L1/L2/L3 Cache, Main Memory, Secondary Storage)',
          'Principle of Locality: Temporal Locality and Spatial Locality',
          'Cache Mapping Techniques: Direct Mapping, Fully Associative, and Set-Associative Mapping',
          'Cache Miss Classification (The 3Cs: Compulsory, Capacity, Conflict misses)',
          'Cache Write Policies: Write-Through vs Write-Back, Write-Allocate vs No-Write-Allocate',
        ],
        coreTopics: ['Memory Hierarchy', 'Locality of Reference', 'Cache Mapping (Direct, Set-Associative)', 'Cache Misses (3Cs)', 'Write Policies'],
        definitions: [
          {
            term: 'Average Memory Access Time (AMAT)',
            definition: 'The effective average latency to access memory: AMAT = Hit Time + (Miss Rate * Miss Penalty).',
          },
          {
            term: 'Set-Associative Cache Mapping',
            definition: 'A compromise mapping where each memory block maps to a specific set (Set = Block_Address % Num_Sets), but can be placed in any of the k ways within that set, reducing conflict misses.',
          },
        ],
        formulasOrInvariants: [
          'AMAT = Hit_Time + Miss_Rate * Miss_Penalty',
          'Direct Mapped Address Partition: Tag bits = Total - (Index + Offset); Set Index bits = log2(Num_Sets); Block Offset bits = log2(Block_Size)',
          'Miss Rate = Misses / Total_Accesses',
        ],
        coreFormulasOrPrinciples: ['AMAT = HitTime + MissRate * MissPenalty', 'Address = Tag | Set Index | Block Offset', 'Compulsory + Capacity + Conflict'],
        highYieldConcepts: ['Calculating Tag, Set, and Offset bit widths for given memory and cache sizes', 'Write-back with dirty bit vs Write-through with write buffer'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Input-Output Organization & Advanced Architectures',
        title: 'Input-Output Organization & Advanced Architectures',
        weightage: '20%',
        topics: [
          'Peripheral Devices and I/O Interfaces: Asynchronous Data Transfer (Strobe, Handshaking)',
          'Modes of Data Transfer: Programmed I/O, Interrupt-Initiated I/O, and Direct Memory Access (DMA)',
          'DMA Controller Architecture, Burst Transfer vs Cycle Stealing Modes',
          'Bus Arbitration: Daisy Chaining, Polling, and Independent Request',
          'Multiprocessor Systems: Flynn’s Taxonomy (SISD, SIMD, MISD, MIMD), Cache Coherence (MESI Protocol)',
        ],
        coreTopics: ['I/O Interfaces & Handshaking', 'Programmed vs Interrupt I/O', 'DMA Controller & Cycle Stealing', 'Bus Arbitration Methods', 'Flynn Taxonomy & MESI Protocol'],
        definitions: [
          {
            term: 'Direct Memory Access (DMA)',
            definition: 'A hardware feature allowing I/O devices to transfer data directly to or from main memory without continuous CPU intervention, drastically improving transfer throughput.',
          },
          {
            term: 'MESI Protocol',
            definition: 'A four-state write-invalidate cache coherence protocol: Modified (dirty, only copy), Exclusive (clean, only copy), Shared (clean, may exist in other caches), and Invalid.',
          },
        ],
        formulasOrInvariants: [
          'DMA Cycle Stealing CPU degradation: % CPU slowdown = (DMA bus cycles) / (Total bus cycles available)',
          'Flynn’s Taxonomy: Instruction Streams vs Data Streams',
        ],
        coreFormulasOrPrinciples: ['DMA direct memory transfer', 'Cycle stealing vs Burst mode', 'MESI Coherence States'],
        highYieldConcepts: ['Daisy chaining bus arbitration priority mechanism', 'MESI state transitions on local read/write vs bus read/snoop'],
      },
    ],
    examPrepTips: [
      'Show exact bit-partitioning diagrams for memory address decoding (Tag, Set Index, Word/Byte Offset).',
      'For Booth’s algorithm questions, show the step-by-step table columns: Step, Multiplicand (M), Accumulator (A), Multiplier (Q), Q-1, and Operation.',
      'Clearly derive AMAT formulas with multi-level cache hierarchies (L1, L2, and Main Memory).',
    ],
    sampleQuestions: [
      {
        id: 'q-csa-1',
        type: 'mcq',
        question: 'In a 4-way set-associative cache with 64 KB total data capacity and 32-byte block size on a 32-bit physical address system, how many bits are used for the Set Index?',
        options: ['9 bits', '11 bits', '5 bits', '16 bits'],
        correctIndex: 0,
        explanation: 'Block size = 32 bytes (5 offset bits). Total blocks = 64 KB / 32 B = 2048 blocks. In a 4-way set-associative cache, number of sets = 2048 / 4 = 512 sets. Set index bits = log2(512) = 9 bits.',
      },
      {
        id: 'q-csa-2',
        type: 'mcq',
        question: 'Which pipeline hazard is resolved by hardware operand forwarding without requiring stall cycles?',
        options: ['Read-After-Write (RAW) data hazard from the immediately preceding ALU instruction', 'Structural hazard due to single memory port', 'Branch instruction misprediction', 'Cache miss on instruction fetch'],
        correctIndex: 0,
        explanation: 'Operand forwarding routes the computed ALU output directly from the EX/MEM pipeline register back to the ALU input for the next instruction in ID/EX, eliminating RAW stalls for ALU-to-ALU operations.',
      },
      {
        id: 'q-csa-3',
        type: 'mcq',
        question: 'According to Amdahl’s Law, if 75% of a program can be parallelized, what is the theoretical maximum speedup achievable with an infinite number of processors?',
        options: ['4x', '8x', '1.33x', 'Infinite speedup'],
        correctIndex: 0,
        explanation: 'Amdahl’s Law states Speedup = 1 / ((1 - p) + (p / s)). As s -> infinity, speedup approaches 1 / (1 - p). With p = 0.75, 1 / (1 - 0.75) = 1 / 0.25 = 4x maximum theoretical speedup regardless of how many parallel cores are added.',
      },
      {
        id: 'q-csa-4',
        type: 'mcq',
        question: 'In Booth’s multiplication algorithm for signed two’s complement numbers, what operation is performed when the current multiplier bit and previous bit (Q0, Q-1) are (0, 1)?',
        options: [
          'Add Multiplicand M to Accumulator A (A = A + M), then perform Arithmetic Shift Right (ASR)',
          'Subtract Multiplicand M from Accumulator A (A = A - M), then perform ASR',
          'Perform Arithmetic Shift Right only without arithmetic',
          'Logical Shift Left the accumulator and multiplier',
        ],
        correctIndex: 0,
        explanation: 'In Booth’s algorithm, (0, 1) marks the end of a block of ones, requiring an addition (A = A + M) followed by an arithmetic right shift (ASR). Conversely, (1, 0) marks the beginning of a block of ones, requiring a subtraction (A = A - M) before ASR.',
      },
      {
        id: 'q-csa-5',
        type: 'mcq',
        question: 'In virtual memory systems, what is the primary function of an Inverted Page Table?',
        options: [
          'It maintains one entry per physical page frame rather than one entry per virtual page, dramatically reducing page table memory footprint',
          'It maps physical addresses directly to secondary storage blocks',
          'It replaces the hardware TLB with a software cache',
          'It eliminates translation latency for write operations',
        ],
        correctIndex: 0,
        explanation: 'Traditional page tables require entries for every virtual page in each process’s address space (which can be huge for 64-bit systems). An Inverted Page Table indexes by physical page frame (one entry per frame in RAM), drastically reducing overhead.',
      },
    ],
    sampleFlashcards: [
      {
        front: 'State Amdahl’s Law formula and explain its physical significance.',
        back: 'Speedup S = 1 / ((1 - p) + (p / s)), where p is the proportion of the program that can be parallelized and s is the speedup of that part. It demonstrates that the maximum overall speedup is strictly limited by the sequential fraction (1 - p).',
        sourceRef: 'CS-203 — Unit 3: Pipelining',
      },
      {
        front: 'What are the three categories of cache misses (The 3Cs) and how are they mitigated?',
        back: '1. Compulsory (Cold) misses: First access to a block (mitigated by larger block size or prefetching). 2. Capacity misses: Cache cannot hold all working set blocks (mitigated by increasing total cache size). 3. Conflict misses: Multiple blocks map to the same set (mitigated by increasing associativity).',
        sourceRef: 'CS-203 — Unit 4: Memory Hierarchy',
      },
    ],
  },

  'CS-301': {
    code: 'CS-301',
    name: 'Database Management Systems',
    aliases: ['dbms', 'database', 'databases', 'sql', 'cs301'],
    semester: 5,
    credits: 4,
    description: 'Relational model, relational algebra, SQL optimization, functional dependencies, 1NF-BCNF normalization, transaction ACID properties, concurrency control, and B+ Tree indexing.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Relational Architecture & Relational Algebra',
        title: 'Relational Architecture & Relational Algebra',
        weightage: '20%',
        topics: [
          'Three-Schema Architecture: Physical, Conceptual, and External Views; Data Independence',
          'Data Models: ER Modeling, Enhanced ER, Entity Sets, Weak Entities, Key Constraints',
          'Relational Model Concepts: Relations, Tuples, Attributes, Domains, Keys (Candidate, Primary, Super, Foreign)',
          'Relational Algebra Fundamental Operations: Select (sigma), Project (pi), Union, Set Difference, Cartesian Product, Rename (rho)',
          'Additional Relational Algebra Operations: Natural Join, Theta Join, Outer Joins, Division Operation',
        ],
        coreTopics: ['Three-Schema Architecture', 'ER Diagrams & Constraints', 'Relational Model Keys', 'Relational Algebra Operators', 'Joins & Division'],
        definitions: [
          {
            term: 'Physical Data Independence',
            definition: 'The capacity to change the internal physical storage structures (e.g., indexes, disk reorganization) without altering the conceptual schema or external application programs.',
          },
          {
            term: 'Relational Algebra Natural Join',
            definition: 'A binary operator (R |><| S) combining tuples from two relations that have matching values on all common attribute names, projecting out duplicate join attributes.',
          },
        ],
        formulasOrInvariants: [
          'Natural Join definition: R |><| S = pi_{schema(R) union schema(S)}(sigma_{R.A1=S.A1 and ... and R.An=S.An}(R x S))',
          'Referential Integrity Invariant: Foreign Key FK in R must reference a valid existing Primary Key in S, or be NULL',
        ],
        coreFormulasOrPrinciples: ['pi for projection, sigma for selection', 'R |><| S join logic', 'Referential Integrity Constraint'],
        highYieldConcepts: ['Relational Division operation for "find employees who worked on all projects"', 'Weak entity set identification keys (double rectangle / double diamond)'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: SQL & Advanced Query Processing',
        title: 'SQL & Advanced Query Processing',
        weightage: '20%',
        topics: [
          'DDL, DML, DCL, and TCL Commands in SQL',
          'Complex SQL Queries: Nested Subqueries, Correlated Subqueries, IN, EXISTS, ALL, ANY',
          'Aggregate Functions (COUNT, SUM, AVG, MIN, MAX) and GROUP BY / HAVING Clauses',
          'Views: Updatable vs Read-only Views and View Materialization',
          'Stored Procedures, Triggers, Assertions, and Database Security Privileges',
        ],
        coreTopics: ['DDL/DML Commands', 'Correlated Subqueries', 'Aggregate Functions & HAVING', 'Views & Materialization', 'Triggers & Stored Procedures'],
        definitions: [
          {
            term: 'Correlated Subquery',
            definition: 'A subquery that evaluates once for each candidate row evaluated by the outer query, referencing columns from the outer query relation.',
          },
          {
            term: 'HAVING Clause',
            definition: 'Filters grouped records produced by a GROUP BY clause based on aggregate predicate conditions, evaluated after grouping, unlike WHERE which filters individual rows before grouping.',
          },
        ],
        formulasOrInvariants: [
          'SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT',
          'Correlated evaluation cost: O(N_outer * Subquery_cost)',
        ],
        coreFormulasOrPrinciples: ['FROM -> WHERE -> GROUP BY -> HAVING -> SELECT', 'Correlated row-by-row dependency', 'Aggregate over groups'],
        highYieldConcepts: ['Difference between WHERE and HAVING with practical SQL examples', 'LEFT OUTER JOIN vs INNER JOIN semantics with NULL handling'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Functional Dependencies & Normalization',
        title: 'Functional Dependencies & Normalization',
        weightage: '20%',
        topics: [
          'Functional Dependencies (FDs): Definition, Trivial vs Non-Trivial FDs, Closure of FDs (Armstrong’s Axioms)',
          'Attribute Closure Algorithm (X+) and Determining Candidate Keys',
          'Normal Forms: First Normal Form (1NF - Atomic values), Second Normal Form (2NF - No partial dependencies)',
          'Third Normal Form (3NF - No transitive dependencies) and Boyce-Codd Normal Form (BCNF)',
          'Lossless Join Decomposition and Dependency Preservation Verification',
        ],
        coreTopics: ['Functional Dependencies', 'Armstrong’s Axioms & Attribute Closure', '1NF, 2NF, 3NF', 'BCNF Conditions', 'Lossless Decomposition'],
        definitions: [
          {
            term: 'Boyce-Codd Normal Form (BCNF)',
            definition: 'A relation R is in BCNF if for every non-trivial functional dependency X -> Y, X is a superkey of R. BCNF strictly eliminates all redundancy based on functional dependencies.',
          },
          {
            term: 'Lossless Join Decomposition',
            definition: 'A decomposition of relation R into R1 and R2 is lossless if and only if (R1 intersect R2) -> R1 or (R1 intersect R2) -> R2 (the common attributes must form a superkey of at least one relation).',
          },
        ],
        formulasOrInvariants: [
          'Armstrong’s Axioms: Reflexivity (if Y subset X then X -> Y), Augmentation (if X -> Y then XZ -> YZ), Transitivity (if X -> Y and Y -> Z then X -> Z)',
          '3NF condition for X -> Y: Either X is a superkey OR Y is a prime attribute (part of some candidate key)',
          'Lossless Join test: (R1 intersect R2) -> R1 in F+ OR (R1 intersect R2) -> R2 in F+',
        ],
        coreFormulasOrPrinciples: ['BCNF: X must be Superkey', '3NF: X is Superkey OR Y is Prime', 'Lossless: R1 intersect R2 is key of R1 or R2'],
        highYieldConcepts: ['Calculating attribute closure X+ to find all candidate keys', 'Why some BCNF decompositions cannot preserve functional dependencies (3NF tradeoff)'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Transaction Processing & Concurrency Control',
        title: 'Transaction Processing & Concurrency Control',
        weightage: '20%',
        topics: [
          'Transaction Concepts and ACID Properties (Atomicity, Consistency, Isolation, Durability)',
          'Transaction States (Active, Partially Committed, Committed, Failed, Aborted)',
          'Schedules: Conflict Serializability, Precedence Graph (Serialization Graph), View Serializability',
          'Recoverability of Schedules: Recoverable, Cascadeless (Avoids Cascading Aborts), and Strict Schedules',
          'Concurrency Control Protocols: Two-Phase Locking (2PL), Strict 2PL, Rigorous 2PL, Timestamp Ordering Protocol',
        ],
        coreTopics: ['ACID Properties', 'Transaction States', 'Conflict Serializability & Precedence Graph', 'Recoverable & Cascadeless Schedules', 'Two-Phase Locking (2PL)'],
        definitions: [
          {
            term: 'Conflict Serializability',
            definition: 'A schedule S is conflict serializable if it is conflict equivalent to some serial schedule S_prime, verified by the absence of cycles in its precedence graph.',
          },
          {
            term: 'Strict Two-Phase Locking (Strict 2PL)',
            definition: 'A protocol requiring that all exclusive (write) locks acquired by a transaction must be held until the transaction explicitly commits or aborts, guaranteeing cascadelessness and recoverability.',
          },
        ],
        formulasOrInvariants: [
          'Precedence Graph: Edge Ti -> Tj exists if Ti performs an operation conflicting with Tj (Write-Read, Read-Write, Write-Write on same item) and Ti executed first. Cycle => Not conflict serializable',
          'Strict 2PL Invariant: Exclusive locks released only AFTER commit/abort record is written to WAL',
        ],
        coreFormulasOrPrinciples: ['No cycle in precedence graph <=> Conflict Serializable', 'Growing phase (acquire) -> Shrinking phase (release)', 'ACID guarantees'],
        highYieldConcepts: ['Constructing precedence graphs to prove serializability', 'Deadlock detection using Wait-For Graphs (WFG) vs Wait-Die / Wound-Wait prevention schemes'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Storage, Indexing & Query Optimization',
        title: 'Storage, Indexing & Query Optimization',
        weightage: '20%',
        topics: [
          'Physical Storage Organization: Fixed-Length vs Variable-Length Records, Page Formats',
          'File Organizations: Heap Files, Sorted Files, Hash Files',
          'Indexing Architectures: Primary, Secondary, Clustering, and Dense vs Sparse Indexes',
          'B-Trees and B+ Trees: Structure, Node Splitting, Search, Insertion, and Deletion',
          'Query Processing Steps: Parsing, Translation, Relational Algebra Equivalence Rules, Cost-Based Query Optimizer',
        ],
        coreTopics: ['Record Storage & Slotted Pages', 'Primary vs Secondary Index', 'B+ Tree Structure & Operations', 'B+ Tree Search & Range Queries', 'Cost-Based Optimization'],
        definitions: [
          {
            term: 'B+ Tree',
            definition: 'A self-balancing, multi-way search tree where all data records/pointers reside exclusively in leaf nodes linked horizontally as a doubly linked list, while internal nodes store only routing keys.',
          },
          {
            term: 'Clustering Index',
            definition: 'An index created on an ordered data file where the search key specifies an ordering that determines the physical ordering of the records on disk (at most one clustering index per table).',
          },
        ],
        formulasOrInvariants: [
          'B+ Tree node occupancy: Every node (except root) has at least ceil(m / 2) children where m is order',
          'B+ Tree height bound: h <= ceil(log_{ceil(m/2)}(N / 2)) + 1',
          'Range query cost in B+ Tree: O(log_m N + (Num_Matches / Block_Factor))',
        ],
        coreFormulasOrPrinciples: ['All data in leaves', 'Leaves linked horizontally for range scans', 'Node capacity: ceil(m/2) to m'],
        highYieldConcepts: ['Step-by-step B+ tree node splitting when insertion exceeds node order m', 'Why B+ trees are preferred over B-trees for database storage engines'],
      },
    ],
    examPrepTips: [
      'For BCNF/3NF questions, write the full step-by-step attribute closure calculation X+ for every functional dependency.',
      'Always construct the precedence graph with explicit directed edges and labeled conflicting operations to prove conflict serializability.',
      'Show B+ tree pointer adjustments clearly when splitting leaf and internal nodes.',
    ],
    sampleQuestions: [
      {
        id: 'q-dbms-1',
        type: 'mcq',
        question: 'Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D}. What is the highest normal form satisfied by R?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctIndex: 1,
        explanation: 'The candidate key is A (since A+ = {A,B,C,D}). In dependency B -> C, B is not a superkey and C is not prime, which violates 3NF. In A -> B, A is candidate key. However, for 2NF there is no partial dependency because A is a single attribute key. But B -> C is a transitive dependency (non-prime attribute determining non-prime), so R is in 2NF, not 3NF. Wait: 2NF is satisfied, 3NF is violated! Highest normal form is 2NF.',
      },
      {
        id: 'q-dbms-2',
        type: 'mcq',
        question: 'Why are B+ trees universally preferred over B-trees for implementing relational database indexes?',
        options: [
          'Leaf nodes are linked in a linked list allowing high-efficiency range scans, and internal nodes hold more keys maximizing fan-out',
          'B+ trees do not require node rebalancing',
          'B+ trees consume less RAM for leaf nodes',
          'B-trees cannot store string keys',
        ],
        correctIndex: 0,
        explanation: 'In B+ trees, non-leaf nodes store only keys and pointers (no data records), maximizing node fan-out and reducing tree height. Furthermore, leaf nodes are linked sequentially, enabling rapid O(1) sequential disk scans for range queries.',
      },
      {
        id: 'q-dbms-3',
        type: 'mcq',
        question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads under ANSI SQL standards?',
        options: ['Repeatable Read', 'Read Committed', 'Read Uncommitted', 'Serializable'],
        correctIndex: 0,
        explanation: 'Repeatable Read holds shared read locks until transaction completion, preventing other transactions from updating read rows (preventing dirty and non-repeatable reads). However, it does not hold range/predicate locks, allowing concurrent transactions to insert new qualifying tuples (phantom reads).',
      },
      {
        id: 'q-dbms-4',
        type: 'mcq',
        question: 'In the Two-Phase Locking (2PL) protocol, what condition guarantees that a schedule is conflict serializable?',
        options: [
          'Once a transaction releases any lock (enters contracting phase), it can obtain no new locks',
          'All transactions must acquire shared locks before exclusive locks',
          'Transactions must release all locks before executing commit',
          'Locks must be acquired in lexicographical order of relation names',
        ],
        correctIndex: 0,
        explanation: 'The fundamental invariant of 2PL is the two-phase rule: a growing phase where locks are acquired but not released, followed by a shrinking phase where locks are released but none acquired. This guarantees conflict serializability by preventing cycle formation in the precedence graph.',
      },
      {
        id: 'q-dbms-5',
        type: 'mcq',
        question: 'During ARIES database crash recovery, in which order are the three recovery phases executed?',
        options: [
          'Analysis Phase -> Redo Phase (repeating history) -> Undo Phase (rolling back uncommitted active transactions)',
          'Redo Phase -> Analysis Phase -> Undo Phase',
          'Undo Phase -> Redo Phase -> Analysis Phase',
          'Check-pointing Phase -> Redo Phase -> Recovery Phase',
        ],
        correctIndex: 0,
        explanation: 'ARIES executes 3 distinct recovery passes: (1) Analysis: scans log from last checkpoint forward to reconstruct Dirty Page Table and Active Transaction Table; (2) Redo: repeats history forward from smallest recLSN to restore state at crash; (3) Undo: scans backward rolling back actions of active loser transactions.',
      },
    ],
    sampleFlashcards: [
      {
        front: 'State the difference between 3NF and BCNF definitions for a functional dependency X -> Y.',
        back: 'In BCNF, for every non-trivial FD X -> Y, X must be a superkey. In 3NF, X must be a superkey OR Y must be a prime attribute (part of some candidate key). BCNF eliminates all redundancy but cannot always preserve all functional dependencies.',
        sourceRef: 'CS-301 — Unit 3: Normalization',
      },
      {
        front: 'Explain the 4 ACID properties of database transactions.',
        back: 'Atomicity: All operations in the transaction succeed or all are rolled back. Consistency: The database transitions from one valid state to another, satisfying all integrity constraints. Isolation: Concurrent transactions execute without interfering with one another. Durability: Committed updates survive system crashes permanently (WAL).',
        sourceRef: 'CS-301 — Unit 4: Transaction Processing',
      },
      {
        front: 'What is Strict 2PL and why does it prevent cascading aborts?',
        back: 'Strict 2PL requires that a transaction holds all its exclusive (write) locks until it completes (commits or aborts). Since other transactions cannot read uncommitted data written by T, no transaction can ever develop a dependency on uncommitted data, preventing cascading rollbacks.',
        sourceRef: 'CS-301 — Unit 4: Concurrency Control',
      },
    ],
  },

  'CS-302': {
    code: 'CS-302',
    name: 'Operating Systems',
    aliases: ['os', 'operating systems', 'operating system', 'cs302', 'cs-202-os'],
    semester: 4,
    credits: 4,
    description: 'Kernel architectures, process management, scheduling, concurrency and synchronization, deadlock prevention/avoidance, virtual memory paging, and file system implementation.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Kernel Architectures & Process Management',
        title: 'Kernel Architectures & Process Management',
        weightage: '20%',
        topics: [
          'Operating System Structures: Monolithic, Microkernel, Layered, and Hybrid Kernels',
          'Dual-Mode Operation (User Mode vs Kernel Mode) and System Calls Mechanism',
          'Process Concept: Process Control Block (PCB), Process States, and State Transitions',
          'Process Creation and Termination (fork, exec, wait, exit in POSIX)',
          'Context Switching Overhead, Inter-Process Communication (Shared Memory vs Message Passing)',
        ],
        coreTopics: ['Kernel Architectures', 'Dual-Mode Operation', 'Process States & PCB', 'fork/exec Mechanics', 'Context Switching & IPC'],
        definitions: [
          {
            term: 'Process Control Block (PCB)',
            definition: 'A kernel data structure containing all metadata representing a process, including PID, process state, program counter (PC), CPU registers, memory management limits, and open file descriptors.',
          },
          {
            term: 'Context Switch',
            definition: 'The computational procedure of saving the execution context (registers, stack pointer, PC) of the currently running process and restoring the context of the next scheduled process.',
          },
        ],
        formulasOrInvariants: [
          'fork() return value invariant: returns child PID in parent process, returns 0 in child process, returns -1 on error',
          'Context switch cost: Direct CPU register save/restore + Indirect cache pollution (TLB invalidation)',
        ],
        coreFormulasOrPrinciples: ['Dual-mode protection ring', 'PCB state management', 'fork() returns 0 to child, PID to parent'],
        highYieldConcepts: ['Zombie process vs Orphan process lifecycle and wait() handling', 'Microkernel message passing overhead vs monolithic performance'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: CPU Scheduling & Multithreading',
        title: 'CPU Scheduling & Multithreading',
        weightage: '20%',
        topics: [
          'CPU-I/O Burst Cycle and Preemptive vs Non-Preemptive Scheduling',
          'Scheduling Criteria: Turnaround Time, Waiting Time, Response Time, Throughput, and CPU Utilization',
          'Algorithms: First-Come First-Served (FCFS), Shortest Job First (SJF / SRTF), Priority Scheduling',
          'Round Robin (RR) Scheduling: Impact of Time Quantum q on Overhead and Responsiveness',
          'Multilevel Queue and Multilevel Feedback Queue (MLFQ) Scheduling, Multi-threading Models (Many-to-One, One-to-One, Many-to-Many)',
        ],
        coreTopics: ['Burst Cycles & Criteria', 'FCFS & Convoy Effect', 'SJF & SRTF Optimality', 'Round Robin & Time Quantum', 'Multilevel Feedback Queue'],
        definitions: [
          {
            term: 'Shortest Remaining Time First (SRTF)',
            definition: 'The preemptive variant of SJF scheduling that selects the process with the shortest remaining burst time. Provably achieves minimal average waiting time.',
          },
          {
            term: 'Convoy Effect',
            definition: 'A phenomenon in FCFS scheduling where multiple short CPU-bound or I/O-bound processes are delayed behind a single long CPU-intensive process, plummeting CPU/device utilization.',
          },
        ],
        formulasOrInvariants: [
          'Turnaround Time (TAT) = Completion Time - Arrival Time',
          'Waiting Time (WT) = Turnaround Time - Burst Time',
          'Exponential Averaging for next burst prediction: tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n',
        ],
        coreFormulasOrPrinciples: ['TAT = CT - AT', 'WT = TAT - BT', 'RR: q -> infinity => FCFS; q -> 0 => processor sharing'],
        highYieldConcepts: ['Gantt chart construction for SRTF with preemption', 'Tuning time quantum q in Round Robin to balance context-switch overhead vs response latency'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Synchronization & Concurrency',
        title: 'Synchronization & Concurrency',
        weightage: '20%',
        topics: [
          'Critical Section Problem and Criteria (Mutual Exclusion, Progress, Bounded Waiting)',
          'Software Solutions: Peterson’s Algorithm for Two Processes and Its Proof',
          'Hardware Support: TestAndSet, CompareAndSwap (CAS) Atomic Instructions, Memory Barriers',
          'Semaphores: Counting vs Binary Semaphores, wait() / signal() (P and V) Operations',
          'Classic Synchronization Problems: Producer-Consumer (Bounded Buffer), Readers-Writers, Dining Philosophers',
        ],
        coreTopics: ['Critical Section Criteria', 'Peterson’s Algorithm', 'Atomic Hardware CAS', 'Semaphores (wait/signal)', 'Classic Problems (Dining Philosophers)'],
        definitions: [
          {
            term: 'Critical Section Criteria',
            definition: 'A valid solution must satisfy: 1. Mutual Exclusion (at most one process in CS), 2. Progress (selection of next entrant cannot be postponed indefinitely), 3. Bounded Waiting (limit on times others can enter before a requesting process enters).',
          },
          {
            term: 'Counting Semaphore',
            definition: 'A synchronization primitive with an integer value initialized to available resources. wait() decrements the counter (blocking if < 0); signal() increments the counter (waking a blocked process).',
          },
        ],
        formulasOrInvariants: [
          'wait(S): S.value--; if (S.value < 0) { block(); }',
          'signal(S): S.value++; if (S.value <= 0) { wakeup(P); }',
          'Dining Philosophers deadlock-free condition: Asymmetric pickup (e.g. odd philosophers pick left first, even pick right first)',
        ],
        coreFormulasOrPrinciples: ['Mutual Exclusion', 'Progress', 'Bounded Waiting', 'wait() / signal() invariants'],
        highYieldConcepts: ['Peterson’s algorithm proof verifying mutual exclusion and progress', 'Binary semaphore implementation of mutex vs counting semaphore for resource pool'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Deadlocks',
        title: 'Deadlocks',
        weightage: '20%',
        topics: [
          'The Deadlock Problem and System Model',
          'The 4 Coffman Necessary Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
          'Resource Allocation Graph (RAG) and Cycle Detection Rules',
          'Deadlock Prevention (invalidating one of the 4 conditions)',
          'Deadlock Avoidance: Safe States and Banker’s Algorithm for Single and Multiple Resource Types',
          'Deadlock Detection and Recovery Strategies (Process Termination, Resource Preemption)',
        ],
        coreTopics: ['Coffman Conditions', 'Resource Allocation Graph', 'Deadlock Prevention', 'Banker’s Safety Algorithm', 'Deadlock Recovery'],
        definitions: [
          {
            term: 'Banker’s Algorithm',
            definition: 'A deadlock avoidance algorithm that tests whether granting a resource request leaves the system in a safe state, where a safe sequence exists to satisfy maximum claims of all processes.',
          },
          {
            term: 'Safe State',
            definition: 'A state where there exists a sequence <P1, P2, ..., Pn> such that for each Pi, the resources Pi still needs can be satisfied by currently available resources plus resources held by all Pj (j < i).',
          },
        ],
        formulasOrInvariants: [
          'Need Matrix Calculation: Need[i][j] = Max[i][j] - Allocation[i][j]',
          'Banker’s Safety Test condition: if (Finish[i] == false && Need[i] <= Work) { Work += Allocation[i]; Finish[i] = true; }',
        ],
        coreFormulasOrPrinciples: ['Need = Max - Allocation', 'Work = Available', 'Cycle in RAG is necessary for deadlock (sufficient if single instance)'],
        highYieldConcepts: ['Executing Banker’s Algorithm step-by-step to find the safe sequence', 'Circular wait elimination via strict global resource ordering'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Memory Management, Virtual Memory & File Systems',
        title: 'Memory Management, Virtual Memory & File Systems',
        weightage: '20%',
        topics: [
          'Contiguous Memory Allocation, Logical vs Physical Address Spaces, Memory Management Unit (MMU)',
          'Paging Hardware, Page Table Base Register (PTBR), Translation Lookaside Buffer (TLB)',
          'Multi-level Paging, Inverted Page Tables, Segmentation',
          'Virtual Memory & Demand Paging: Page Fault Handling Sequence',
          'Page Replacement Algorithms: FIFO (Belady’s Anomaly), Optimal (OPT / MIN), Least Recently Used (LRU), Clock Algorithm',
          'Thrashing and Working Set Model, File Allocation Methods (Contiguous, Linked, Indexed / Inode)',
        ],
        coreTopics: ['Paging & TLB Mechanics', 'Effective Access Time (EAT)', 'Page Fault Handling', 'Page Replacement (FIFO, LRU, OPT)', 'Thrashing & Working Set', 'Inodes'],
        definitions: [
          {
            term: 'Translation Lookaside Buffer (TLB)',
            definition: 'A fast associative hardware cache storing recently used virtual-to-physical page table translations, significantly reducing memory access latency.',
          },
          {
            term: 'Belady’s Anomaly',
            definition: 'The counterintuitive phenomenon in FIFO page replacement where increasing the number of allocated page frames results in an increase in the number of page faults.',
          },
          {
            term: 'Thrashing',
            definition: 'A state of catastrophic performance collapse where the operating system spends more time servicing page faults than executing actual instructions, caused by overcommitting memory.',
          },
        ],
        formulasOrInvariants: [
          'Effective Memory Access Time (EAT) with TLB: EAT = Hit_Ratio * (tlb_time + mem_time) + (1 - Hit_Ratio) * (tlb_time + 2 * mem_time)',
          'Demand Paging EAT: EAT = (1 - p) * mem_access + p * page_fault_service_time',
          'Unix Inode architecture: Direct blocks (12) + 1 Single Indirect + 1 Double Indirect + 1 Triple Indirect',
        ],
        coreFormulasOrPrinciples: ['EAT with TLB hit/miss', 'EAT with page fault probability p', 'Belady’s anomaly in FIFO, not in Stack algorithms (LRU, OPT)'],
        highYieldConcepts: ['Calculating EAT given TLB hit ratio and memory speeds', 'Tracing FIFO, LRU, and OPT step-by-step for a given page reference string'],
      },
    ],
    examPrepTips: [
      'Draw complete Gantt charts for CPU scheduling questions and write explicit formulas for Waiting Time and Turnaround Time.',
      'For Banker’s algorithm, write out the complete Need matrix table before testing each process against Work vector.',
      'Show the frame state table after every memory reference when tracing page replacement algorithms, and explicitly tally total page faults.',
    ],
    sampleQuestions: [
      {
        id: 'q-os-1',
        type: 'mcq',
        question: 'Which page replacement algorithm can suffer from Belady’s Anomaly (where increasing frames increases page faults)?',
        options: ['FIFO (First-In, First-Out)', 'LRU (Least Recently Used)', 'Optimal Page Replacement', 'LFU with aging counter'],
        correctIndex: 0,
        explanation: 'Belady’s anomaly occurs in FIFO because FIFO does not belong to the class of stack algorithms (where the set of pages in k frames is always a subset of pages in k+1 frames). LRU and Optimal are stack algorithms and never suffer from Belady’s anomaly.',
      },
      {
        id: 'q-os-2',
        type: 'mcq',
        question: 'In a demand paging system with memory access time of 100 ns and page fault service time of 8 ms (8,000,000 ns), what is the maximum page fault rate to keep Effective Access Time within 200 ns?',
        options: ['1 out of 80,000 accesses (p <= 0.0000125)', '1 out of 100 accesses (p <= 0.01)', '1 out of 500 accesses (p <= 0.002)', '1 out of 1,000 accesses (p <= 0.001)'],
        correctIndex: 0,
        explanation: 'EAT = (1 - p)*100 + p*8,000,000 <= 200 => 100 - 100p + 8,000,000p <= 200 => 7,999,900p <= 100 => p <= 100 / 7,999,900 ~= 1 / 80,000 accesses.',
      },
      {
        id: 'q-os-3',
        type: 'mcq',
        question: 'Which condition is NOT one of the 4 Coffman conditions required for a deadlock to occur?',
        options: ['Preemptive resource allocation', 'Mutual exclusion', 'Hold and wait', 'Circular wait'],
        correctIndex: 0,
        explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. If preemption is enforced, deadlocks cannot form.',
      },
      {
        id: 'q-os-4',
        type: 'mcq',
        question: 'In the Banker’s Algorithm for deadlock avoidance, a state is declared "safe" if and only if:',
        options: [
          'There exists at least one safe sequence of process executions <P1, P2, ..., Pn> where each process can finish using available resources and resources released by preceding processes',
          'No process currently holds exclusive locks on any resource',
          'Total allocated resources equal total available resources',
          'The CPU scheduling queue is strictly non-preemptive',
        ],
        correctIndex: 0,
        explanation: 'A state is safe in the Banker’s Algorithm if there exists a safe sequence <P1, ..., Pn> such that for each Pi, its maximum remaining resource Need[i] <= Available + sum(Allocation[j] for j < i). Safe states are guaranteed deadlock-free.',
      },
      {
        id: 'q-os-5',
        type: 'mcq',
        question: 'In Unix-like systems, how does the copy-on-write (COW) technique optimize the fork() system call?',
        options: [
          'Parent and child initially share physical memory pages marked read-only; a private duplicate page is allocated only when either process attempts a write',
          'It immediately duplicates the entire user address space during fork()',
          'It forces the child process to execute execve() in a separate kernel thread',
          'It compresses dirty pages into swap space before fork() returns',
        ],
        correctIndex: 0,
        explanation: 'Instead of copying all physical pages of the parent (which is wasteful if the child immediately calls exec()), fork() with COW maps parent pages into the child with read-only permissions. When either process attempts to write, a page fault occurs and the kernel duplicates only that modified page.',
      },
    ],
    sampleFlashcards: [
      {
        front: 'What are the 3 criteria required to solve the Critical Section problem?',
        back: '1. Mutual Exclusion: At most one process can execute in its critical section at any time. 2. Progress: If no process is in its critical section, only processes wishing to enter can participate in deciding who enters next, and this decision cannot be postponed indefinitely. 3. Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter after a process has requested entry.',
        sourceRef: 'CS-302 — Unit 3: Synchronization',
      },
      {
        front: 'Explain the difference between a Zombie Process and an Orphan Process in Unix.',
        back: 'A Zombie process is a process that has completed execution (called exit()) but still has an entry in the process table because its parent has not yet read its exit status via wait(). An Orphan process is an active running process whose parent terminated without waiting; it is adopted by init (PID 1) or systemd.',
        sourceRef: 'CS-302 — Unit 1: Process Management',
      },
      {
        front: 'What is Thrashing in operating systems and how does the Working Set Model prevent it?',
        back: 'Thrashing occurs when a process does not have enough frames to hold its working set, causing continuous page faults and near-zero CPU utilization. The Working Set Model monitors the set of pages accessed during the most recent window Delta; if total working set demand exceeds available frames, the OS suspends a process.',
        sourceRef: 'CS-302 — Unit 5: Memory Management',
      },
    ],
  },

  'CS-303': {
    code: 'CS-303',
    name: 'Computer Networks',
    aliases: ['cn', 'networks', 'computer networks', 'networking', 'cs303'],
    semester: 5,
    credits: 3,
    description: 'OSI and TCP/IP protocol architectures, packet switching, link-layer flow/error control, IP routing, subnetting, TCP transport flow/congestion control, and application layer protocols.',
    units: [
      {
        unitNumber: 1,
        unit: 'Unit 1: Network Architecture & Physical Layer',
        title: 'Network Architecture & Physical Layer',
        weightage: '20%',
        topics: [
          'Network Topologies (Mesh, Star, Bus, Ring) and Switching Techniques (Packet vs Circuit Switching)',
          'Layered Architectures: ISO/OSI 7-Layer Reference Model vs TCP/IP Protocol Stack',
          'Data Transmission Impairments: Attenuation, Distortion, Noise; Shannon Capacity & Nyquist Bit Rate',
          'Transmission Media: Guided (Twisted Pair, Coaxial, Optical Fiber) vs Unguided (Radio, Microwave)',
          'Packet Delay Components: Processing Delay, Queuing Delay, Transmission Delay, Propagation Delay',
        ],
        coreTopics: ['OSI 7-Layer vs TCP/IP', 'Packet vs Circuit Switching', 'Delay Components', 'Shannon Capacity & Nyquist Theorem', 'Transmission Media'],
        definitions: [
          {
            term: 'Transmission Delay vs Propagation Delay',
            definition: 'Transmission delay (L / R) is the time required to push all packet bits onto the physical transmission link. Propagation delay (d / s) is the time required for one bit to travel through the physical medium from sender to receiver.',
          },
          {
            term: 'Shannon Channel Capacity',
            definition: 'The theoretical maximum error-free data rate of a noisy channel: C = B * log2(1 + SNR), where B is channel bandwidth in Hertz and SNR is signal-to-noise ratio.',
          },
        ],
        formulasOrInvariants: [
          'Total Node Delay: D_total = d_proc + d_queue + d_trans + d_prop',
          'Transmission Delay: d_trans = L / R (Packet length / Transmission rate)',
          'Propagation Delay: d_prop = d / s (Distance / Propagation speed ~ 2*10^8 m/s in fiber)',
          'Nyquist Maximum Bit Rate (noiseless): C = 2 * B * log2(V)',
        ],
        coreFormulasOrPrinciples: ['d_trans = L / R', 'd_prop = d / s', 'Shannon: C = B * log2(1 + SNR)'],
        highYieldConcepts: ['Bandwidth-Delay Product (BDP = R * RTT) representing pipe volume', 'Packet switching statistical multiplexing vs circuit switching reservation'],
      },
      {
        unitNumber: 2,
        unit: 'Unit 2: Data Link Layer & Medium Access Control',
        title: 'Data Link Layer & Medium Access Control',
        weightage: '20%',
        topics: [
          'Data Link Layer Framing: Character Count, Byte Stuffing, Bit Stuffing (Flag 01111110)',
          'Error Detection and Correction: Parity, Checksum, Cyclic Redundancy Check (CRC)',
          'Elementary Flow Control: Stop-and-Wait, Sliding Window Protocols: Go-Back-N (GBN) vs Selective Repeat (SR)',
          'Channel Allocation: ALOHA (Pure and Slotted), Carrier Sense Multiple Access (CSMA/CD and CSMA/CA)',
          'Ethernet (IEEE 802.3), MAC Addresses, Address Resolution Protocol (ARP), and VLANs',
        ],
        coreTopics: ['Framing & Bit Stuffing', 'CRC Error Detection', 'Go-Back-N vs Selective Repeat', 'CSMA/CD & Collision Detection', 'ARP Protocol'],
        definitions: [
          {
            term: 'Cyclic Redundancy Check (CRC)',
            definition: 'An algebraic error-detecting polynomial code that divides the data bitstream by an agreed generator polynomial G(x) using modulo-2 arithmetic, appending the remainder as FCS.',
          },
          {
            term: 'CSMA/CD Collision Condition',
            definition: 'To ensure a transmitting station detects a collision before completing packet transmission, the transmission time must be at least twice the maximum propagation delay: T_trans >= 2 * T_prop.',
          },
        ],
        formulasOrInvariants: [
          'Sliding Window efficiency: U = (W * d_trans) / (d_trans + 2 * d_prop) = W / (1 + 2a), where a = d_prop / d_trans',
          'Maximum Window Size for GBN with m sequence bits: W_sender <= 2^m - 1, W_receiver = 1',
          'Maximum Window Size for Selective Repeat: W_sender + W_receiver <= 2^m -> W_sender = W_receiver <= 2^(m - 1)',
          'Ethernet minimum frame size: L_min = 2 * d_prop * Bandwidth',
        ],
        coreFormulasOrPrinciples: ['T_trans >= 2 * T_prop for CSMA/CD', 'GBN window: 2^m - 1', 'SR window: 2^(m - 1)', 'CRC modulo-2 division'],
        highYieldConcepts: ['Bit stuffing rule: insert 0 after five consecutive 1s', 'Why Selective Repeat requires sender and receiver window <= 2^(m-1) to avoid sequence wrap-around ambiguity'],
      },
      {
        unitNumber: 3,
        unit: 'Unit 3: Network Layer & Routing Protocols',
        title: 'Network Layer & Routing Protocols',
        weightage: '20%',
        topics: [
          'Network Layer Functions: Datagram Networks vs Virtual Circuit Networks',
          'IPv4 Addressing: Classes, Subnetting, Variable-Length Subnet Masking (VLSM), Classless Inter-Domain Routing (CIDR)',
          'IPv6 Architecture, Header Format, and Transition Mechanisms (Dual Stack, Tunneling)',
          'Routing Algorithms: Distance Vector Routing (Bellman-Ford, Count-to-Infinity Problem, Split Horizon)',
          'Link State Routing (Dijkstra’s Algorithm, OSPF), Path Vector Routing (BGP), ICMP, and NAT',
        ],
        coreTopics: ['IPv4 Addressing & Subnetting', 'CIDR & Longest Prefix Match', 'Distance Vector & Count-to-Infinity', 'Link State Routing (OSPF)', 'NAT & ICMP'],
        definitions: [
          {
            term: 'Count-to-Infinity Problem',
            definition: 'A vulnerability in Distance Vector routing where a broken link causes adjacent routers to slowly increment distance estimates in a loop towards infinity, mitigated by Split Horizon and Poison Reverse.',
          },
          {
            term: 'CIDR Longest Prefix Match',
            definition: 'When a router looks up a destination IP in its forwarding table, if multiple entries match the destination, the router selects the entry with the longest subnet mask (most specific network prefix).',
          },
        ],
        formulasOrInvariants: [
          'Usable hosts in a /n IPv4 subnet: 2^(32 - n) - 2 (subtracting Network ID and Directed Broadcast Address)',
          'Bellman-Ford distance vector update: D_x(y) = min_v { c(x, v) + D_v(y) }',
        ],
        coreFormulasOrPrinciples: ['Usable hosts = 2^(32-n) - 2', 'Longest Prefix Match routing', 'Distance Vector: D_x(y) = min(c(x,v) + D_v(y))'],
        highYieldConcepts: ['Step-by-step subnet calculation (network address, broadcast address, valid host range)', 'How Split Horizon with Poison Reverse mitigates two-node routing loops'],
      },
      {
        unitNumber: 4,
        unit: 'Unit 4: Transport Layer Protocols (TCP & UDP)',
        title: 'Transport Layer Protocols (TCP & UDP)',
        weightage: '20%',
        topics: [
          'Transport Layer Services: Port Numbers, Multiplexing/Demultiplexing, Connectionless vs Connection-Oriented',
          'User Datagram Protocol (UDP): Segment Format, Checksum Calculation, Applications (DNS, VoIP)',
          'Transmission Control Protocol (TCP): Segment Header, Sequence and Acknowledgment Numbers',
          'TCP Connection Management: 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Connection Teardown (FIN, TIME_WAIT)',
          'TCP Flow Control (Sliding Window & Receiver Advertised Window) and TCP Congestion Control',
        ],
        coreTopics: ['Port Multiplexing & Sockets', 'UDP Datagrams', 'TCP 3-Way Handshake', 'TIME_WAIT State', 'TCP Congestion Control (Tahoe / Reno)'],
        definitions: [
          {
            term: 'TCP 3-Way Handshake',
            definition: 'Connection establishment protocol: 1. Client sends SYN (seq=x), 2. Server replies with SYN-ACK (seq=y, ack=x+1), 3. Client acknowledges with ACK (ack=y+1). Synchronizes initial sequence numbers securely.',
          },
          {
            term: 'TCP Congestion Control Phases',
            definition: 'Composed of 4 algorithms: Slow Start (exponential window growth cwnd = cwnd + 1 MSS per ACK), Congestion Avoidance (linear growth cwnd = cwnd + 1/cwnd per ACK), Fast Retransmit (on 3 duplicate ACKs), and Fast Recovery.',
          },
        ],
        formulasOrInvariants: [
          'Effective Send Window: Send_Window = min(Congestion_Window cwnd, Receiver_Advertised_Window rwnd)',
          'Slow start threshold adaptation on loss: ssthresh = cwnd / 2; on timeout: cwnd = 1 MSS; on 3 dup ACKs (Reno): cwnd = ssthresh + 3 MSS',
          'Estimated RTT: EstimatedRTT = (1 - alpha) * EstimatedRTT + alpha * SampleRTT (typically alpha = 0.125)',
        ],
        coreFormulasOrPrinciples: ['Effective Window = min(cwnd, rwnd)', 'Slow Start (exponential) -> ssthresh -> Congestion Avoidance (linear)', '3 Dup ACKs triggers Fast Retransmit'],
        highYieldConcepts: ['Why TCP requires TIME_WAIT state (2*MSL) during teardown', 'Tracing cwnd window changes across transmission rounds under Tahoe vs Reno'],
      },
      {
        unitNumber: 5,
        unit: 'Unit 5: Application Layer Protocols & Network Security',
        title: 'Application Layer Protocols & Network Security',
        weightage: '20%',
        topics: [
          'Domain Name System (DNS): Hierarchical Namespace, Resource Records, Recursive vs Iterative Queries',
          'Hypertext Transfer Protocol (HTTP/1.1 Persistent Connections, HTTP/2 Multiplexing, HTTP/3 QUIC)',
          'Email Protocols: SMTP, POP3, IMAP, and MIME Extensions',
          'Network Security Principles: Confidentiality, Integrity, Authentication, Non-Repudiation',
          'Cryptography Foundations: Symmetric (AES) vs Asymmetric (RSA), Digital Signatures, TLS/SSL Handshake, Firewalls',
        ],
        coreTopics: ['DNS Hierarchy & Resolution', 'HTTP/1.1 vs HTTP/2 vs HTTP/3', 'SMTP / IMAP', 'Symmetric vs Asymmetric Crypto', 'TLS 1.3 Handshake'],
        definitions: [
          {
            term: 'DNS Iterative Query',
            definition: 'A query where the queried server returns the best answer it has (e.g. referral to a TLD or authoritative nameserver), requiring the local DNS resolver to follow referrals step-by-step.',
          },
          {
            term: 'TLS Handshake',
            definition: 'A cryptographic protocol establishing a secure channel over TCP: authenticates the server using an X.509 certificate, negotiates cipher suites, and generates shared ephemeral session keys using Diffie-Hellman.',
          },
        ],
        formulasOrInvariants: [
          'RSA Key Generation: n = p * q, phi(n) = (p - 1) * (q - 1); e * d = 1 (mod phi(n))',
          'Encryption: C = M^e mod n; Decryption: M = C^d mod n',
        ],
        coreFormulasOrPrinciples: ['DNS root -> TLD -> Authoritative', 'HTTP/2 stream multiplexing over 1 TCP connection', 'RSA: c = m^e mod n'],
        highYieldConcepts: ['Difference between persistent HTTP with pipelining vs HTTP/2 binary framing multiplexing', 'How Public Key Infrastructure (PKI) and Certificate Authorities verify identity'],
      },
    ],
    examPrepTips: [
      'For subnetting questions, clearly show binary calculations for Subnet Mask, First Valid Host, Last Valid Host, and Directed Broadcast IP.',
      'Always draw clear timing sequence diagrams (with SYN, ACK, and sequence numbers) for TCP handshake and teardown.',
      'Show the exact steps of CRC modulo-2 division, including the zero padding of order equal to the generator degree.',
    ],
    sampleQuestions: [
      {
        id: 'q-cn-1',
        type: 'mcq',
        question: 'An organization is granted the block 198.51.100.0/24 and needs to create 4 equal-sized subnets. What is the subnet mask and how many usable host addresses are available per subnet?',
        options: ['Subnet mask 255.255.255.192 (/26) with 62 usable hosts per subnet', 'Subnet mask 255.255.255.128 (/25) with 126 usable hosts', 'Subnet mask 255.255.255.224 (/27) with 30 usable hosts', 'Subnet mask 255.255.255.240 (/28) with 14 usable hosts'],
        correctIndex: 0,
        explanation: 'To create 4 = 2^2 subnets, 2 bits are borrowed from the host portion: /24 + 2 = /26. A /26 mask has binary 11000000 in the last octet = 255.255.255.192. Each subnet has 32 - 26 = 6 host bits, yielding 2^6 - 2 = 64 - 2 = 62 usable host IP addresses.',
      },
      {
        id: 'q-cn-2',
        type: 'mcq',
        question: 'In TCP congestion control, what event causes TCP Reno to enter Fast Recovery instead of resetting cwnd to 1 MSS?',
        options: [
          'Arrival of 3 duplicate ACKs (indicating packet loss without complete path disconnection)',
          'Retransmission timeout (RTO) expiration',
          'Receipt of an ICMP destination unreachable message',
          'A zero-window advertisement from receiver',
        ],
        correctIndex: 0,
        explanation: 'Receipt of 3 duplicate ACKs indicates that subsequent packets are still successfully reaching the receiver (generating duplicate ACKs). TCP Reno infers mild packet loss, retransmits the missing segment immediately (Fast Retransmit), halves ssthresh, and enters Fast Recovery with cwnd set to ssthresh + 3 MSS.',
      },
      {
        id: 'q-cn-3',
        type: 'mcq',
        question: 'In distance-vector routing protocols like RIP, what mechanism prevents two routers from continuously incrementing hop counts for an unreachable network (Count-to-Infinity problem)?',
        options: [
          'Split Horizon with Poison Reverse (and defining infinity as a small integer like 16)',
          'Diffie-Hellman Key Exchange',
          'Switching to UDP broadcast flooding',
          'Eliminating all subnet masks',
        ],
        correctIndex: 0,
        explanation: 'Split Horizon prevents a router from advertising a route back out the interface through which it learned it. Poison Reverse sets the metric to infinity (16 in RIP) when advertising back, breaking two-node routing loops and mitigating Count-to-Infinity.',
      },
      {
        id: 'q-cn-4',
        type: 'mcq',
        question: 'In the Data Link Layer, why is the generator polynomial G(x) in CRC error detection required to have a non-zero constant term (x^0 = 1)?',
        options: [
          'To ensure that any burst error of odd number of bits or single bit flip is reliably detected',
          'To minimize transmission bandwidth overhead',
          'To enable symmetric cryptographic encryption',
          'To allow full-duplex transmission without carrier sensing',
        ],
        correctIndex: 0,
        explanation: 'If G(x) contains the factor x, it would simply shift the dividend without providing protection against error polynomials that end in zero. Having the constant term x^0 = 1 ensures G(x) does not divide error polynomials corresponding to single-bit transmission errors E(x) = x^i.',
      },
      {
        id: 'q-cn-5',
        type: 'mcq',
        question: 'In TCP connection teardown, what is the purpose of the client remaining in the TIME_WAIT state for 2*MSL (Maximum Segment Lifetime)?',
        options: [
          'To ensure the final ACK reaches the server (and retransmit it if server retransmits FIN), and to allow duplicate segments from the old connection to drain from the network',
          'To allow the client to download remaining HTTP headers',
          'To renegotiate encryption keys for the next connection',
          'To reset the TCP window scale option to default',
        ],
        correctIndex: 0,
        explanation: 'TIME_WAIT lasts 2*MSL (typically 2 minutes): (1) It guarantees that if the client’s final ACK is lost and the server retransmits FIN, the client can re-send the ACK instead of sending an RST; (2) It prevents delayed segments from the terminated connection from being misinterpreted as belonging to a new connection reusing the same socket pair.',
      },
    ],
    sampleFlashcards: [
      {
        front: 'Explain the 3-Way Handshake in TCP connection establishment.',
        back: 'Step 1 (SYN): Client sends SYN with initial sequence number x (SYN=1, ACK=0, seq=x). Step 2 (SYN-ACK): Server replies with SYN and ACK (SYN=1, ACK=1, seq=y, ack=x+1). Step 3 (ACK): Client acknowledges the server (SYN=0, ACK=1, seq=x+1, ack=y+1). Both sides have now verified bidirectional transmission capability.',
        sourceRef: 'CS-303 — Unit 4: Transport Layer',
      },
      {
        front: 'Why must Ethernet satisfy the minimum frame size condition T_trans >= 2 * T_prop in CSMA/CD?',
        back: 'If a frame is too small, a station might finish transmitting the entire frame before a collision signal from the farthest station arrives back at the sender. The sender would believe transmission succeeded cleanly when in fact the frame was corrupted.',
        sourceRef: 'CS-303 — Unit 2: Data Link Layer',
      },
      {
        front: 'State the difference between Distance Vector (Bellman-Ford) and Link State (Dijkstra) routing algorithms.',
        back: 'Distance Vector: Routers share their entire routing table (vector of distances) only with immediate neighbors periodically; slow convergence and vulnerable to count-to-infinity loops. Link State: Routers flood link status (costs to direct neighbors) to all routers across the network using LSPs, enabling every router to independently compute shortest paths via Dijkstra.',
        sourceRef: 'CS-303 — Unit 3: Network Layer',
      },
    ],
  },
};

/**
 * Normalizes subject identifier (code, name, or id) to find matching curriculum
 */
export function getCurriculumBySubject(codeOrId?: string, subjectName?: string): SubjectCurriculum | undefined {
  if (!codeOrId && !subjectName) return undefined;

  const rawKey = String(codeOrId || '').trim();
  const rawName = String(subjectName || '').trim().toLowerCase();

  // 1. Direct code lookup (e.g. 'CS-201', 'cs-201')
  const upperCode = rawKey.toUpperCase();
  if (CURRICULUM_DATA[upperCode]) {
    // If user asked for CS-202 but name explicitly says Operating Systems
    if (upperCode === 'CS-202' && rawName.includes('operating')) {
      return CURRICULUM_DATA['CS-302']; // Return OS
    }
    // If user asked for CS-203 but name explicitly says Database
    if (upperCode === 'CS-203' && (rawName.includes('database') || rawName.includes('dbms'))) {
      return CURRICULUM_DATA['CS-301']; // Return DBMS
    }
    // If user asked for CS-301 but name explicitly says Computer Networks
    if (upperCode === 'CS-301' && rawName.includes('network')) {
      return CURRICULUM_DATA['CS-303']; // Return Computer Networks
    }
    return CURRICULUM_DATA[upperCode];
  }

  // 2. Check subject name against known course titles
  if (rawName) {
    if (rawName.includes('data structure') || rawName.includes('algorithm') || rawName.includes('dsa')) {
      return CURRICULUM_DATA['CS-201'];
    }
    if (rawName.includes('object-oriented') || rawName.includes('oop') || rawName.includes('java') || rawName.includes('c++')) {
      return CURRICULUM_DATA['CS-202'];
    }
    if (rawName.includes('architecture') || rawName.includes('coa') || rawName.includes('organization') || rawName.includes('csa')) {
      return CURRICULUM_DATA['CS-203'];
    }
    if (rawName.includes('database') || rawName.includes('dbms') || rawName.includes('sql')) {
      return CURRICULUM_DATA['CS-301'];
    }
    if (rawName.includes('operating system') || rawName.includes('os ') || rawName === 'os') {
      return CURRICULUM_DATA['CS-302'];
    }
    if (rawName.includes('network') || rawName.includes('computer networks') || rawName.includes('networking')) {
      return CURRICULUM_DATA['CS-303'];
    }
  }

  // 3. Search aliases in all curricula
  const searchStr = (rawKey + ' ' + rawName).toLowerCase();
  for (const curr of Object.values(CURRICULUM_DATA)) {
    if (curr.aliases.some((a) => searchStr.includes(a))) {
      return curr;
    }
  }

  return undefined;
}

/**
 * Formats a subject's rich curriculum into a comprehensive context text string for RAG or prompt context
 */
export function getCurriculumContext(codeOrId?: string, subjectName?: string): string {
  const curriculum = getCurriculumBySubject(codeOrId, subjectName);
  if (!curriculum) return '';

  const unitSections = curriculum.units.map((u) => {
    const topicList = u.topics.map((t) => `  - ${t}`).join('\n');
    const defs = u.definitions.map((d) => `  - **${d.term}**: ${d.definition}`).join('\n');
    const formulas = u.formulasOrInvariants.map((f) => `  - ${f}`).join('\n');
    const tips = u.highYieldConcepts.map((h) => `  - ${h}`).join('\n');

    return `[Unit / Section: ${u.unit} (Weightage: ${u.weightage})]\n` +
      `Core Syllabus Topics:\n${topicList}\n` +
      `Key Definitions:\n${defs}\n` +
      `Formulas & Invariants:\n${formulas}\n` +
      `High-Yield Concepts:\n${tips}`;
  }).join('\n\n');

  const examTips = curriculum.examPrepTips.map((t) => `- ${t}`).join('\n');

  return `Course: ${curriculum.name} (${curriculum.code}) — Semester ${curriculum.semester} (${curriculum.credits} Credits)\n` +
    `Overview: ${curriculum.description}\n\n` +
    `=== SYLLABUS UNITS & DETAILED TOPICS ===\n\n` +
    `${unitSections}\n\n` +
    `=== SEMESTER EXAMINATION PREPARATION GUIDELINES ===\n` +
    `${examTips}`;
}

/**
 * Returns all registered subject curricula
 */
export function getAllCurriculums(): SubjectCurriculum[] {
  return Object.values(CURRICULUM_DATA);
}
