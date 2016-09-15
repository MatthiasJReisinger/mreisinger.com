---
layout: post
title:  "Enabling Polyhedral Optimizations in Julia"
date:   2016-06-01
---
Over the the next few months I will be working on an exciting project as one of
this year's [Google Summer of Code](https://summerofcode.withgoogle.com)
students. My work will aim at making available the power of
[polyhedral optimizations](https://en.wikipedia.org/wiki/Polytope_model) to the
programming language Julia (I also cordially invite you to have a look at my
[project proposal](https://docs.google.com/document/d/1s5mmSW965qmOEbHiM3O4XFz-Vd7cy9TxX9RQaTK_SQo/edit?usp=sharing)
for an overview of my planned activities). When a Julia program is executed its
source code will be translated, at run-time, to native machine code via the
[LLVM](http://llvm.org/) compiler framework. Fortunately, with
[Polly](http://polly.llvm.org/) there already exists a polyhedral optimizer that
can be used for LLVM-based compilers - so theoretically I will "just" have to
integrate Polly into Julia's compiler tool-chain. As often, however, it's the
technical details that make this practically challenging. Now, GSoC already
started last week, the very first steps have been taken and I therefore would
like to give a little insight on my initial activities.

## First steps towards Polly

In LLVM, the basic means to organize functionality is a *pass* - a component
that fulfills a certain (ideally coherent) responsibility within the whole
compilation process. It is then possible to decide quite freely which of LLVM's
functionality to use by instructing it to include only particular passes. The
same holds true for Julia -  when it initializes LLVM it chooses a certain set
of passes that it wants to leverage when compiling programs to machine code.
Also Polly is essentially a collection of such passes that provides all the
necessary analyses and transformations which together make up a polyhedral
optimizer.

LLVM makes it relatively easy to configure it's pass infrastructure, therefore
also making it possible to add Polly's passes to Julia's pass-pipeline in a
relatively non-intrusive manner. The required changes can be viewed at my
according [pull request](https://github.com/JuliaLang/julia/pull/16531) that has
already been merged into Julia's official github repository. Furthermore, this
pull request adds the possibility for Julia programmers to explicitly run
Polly's optimizations for particular functions - therefore a new macro `@polly`
was introduced, to annotate those functions for which Polly should be run.

## How to use the new features

This functionality is still at an early stage and using it requires a few
preparative steps. First of all it is necessary to download and build LLVM and
Polly from source (for example as described
[here](http://polly.llvm.org/get_started.html)). Furthermore, also the
development version of Julia has to be downloaded from its
[github repository](https://github.com/JuliaLang/julia) and Julia's build
process has to be configured in order to build against the previously compiled
version of LLVM/Polly. Therefore a `Make.user` file has to be created that has
to be located where Julia will be built, containing the following lines (where
`YOUR_LLVM_BUILD_DIR` has to point to the previously compiled LLVM build):

```
USE_SYSTEM_LLVM:=1
USE_POLLY:=1
LLVM_CONFIG:=$(YOUR_LLVM_BUILD_DIR)/bin/llvm-config
```

It will then be possible to annotate functions in your Julia programs, to
optimize them via Polly:

```
@polly function foo()
    ...
end
```

## What's next

One of the next goals is to ease this build process by removing the necessity to
manually build LLVM/Polly. Instead, it should be possible to automatically
retrieve and build Polly when building Julia. In addition to that, to give you
an idea of what I will be doing for the rest of the summer then, let's have a
look at the following code sample below. It multiplies the square matrices
`A` and `B`, writing the result to `C`.

```
@polly function matmul(A,B,C)
    m,n = size(A)
    @inbounds for i=1:n, j=1:n, k=1:n
        C[i,j] += A[i,k] * B[k,j]
    end
end
```

Provided the input data you use is not too small, Polly will cause this function
to run significantly faster. However, you might notice the `@inbounds` macro in
front of the `for` loop. Usually, Julia strives to emit bounds-checks array
accesses. With this macro, however,  it will skip these checks and assume that
these accesses will be safe. Normally you should only use this macro for code
regions for which you can be sure that there will not happen any out-of-bounds
accesses. Even though we cannot guarantee all accesses to be safe there's a
particular reason for the presence of the macro - at its current state Polly
will not be able to optimize the code that Julia generates when bound-checks are
enabled. This means removing `@inbounds` here also removes the ability to
optimize this function.

Furthermore, you might also ask yourself why we restricted ourselves to square
matrices. So let's at least remove this restriction to allow the multiplication
of non-square matrices as well:

```
@polly function matmul(A,B,C)
    m,n = size(A)
    n,o = size(B)
    @inbounds for i=1:m, j=1:o, k=1:n
        C[i,j] += A[i,k] * B[k,j]
    end
end
```

Unfortunately, also this change will cause Julia to emit code that can not be
optimized by Polly.

So as these examples suggest, my work will not end here. In order to leverage
the full power of Polly from within Julia it will be necessary to identify the
reasons that prevent Polly from optimizing programs like the above ones. Then,
of course, it will be necessary to either adapt Julia's LLVM code generator to
emit code that is amenable to Polly or to directly adapt Polly's analysis and
transformation passes and to improve their applicability.

Either way, I'm looking forward to letting you know about any prospective
findings.

## Acknowledgements

Special thanks go to Karthik Senthil who provided a first patch that
experimentally integrated Polly into an earlier version of Julia which built the
basis for my first changes and helped me to find my way into Julia's internals.
