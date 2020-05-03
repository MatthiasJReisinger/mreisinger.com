---
category: 'blog'
title:  'Google Summer of Code Finals'
date: '2016-08-22'
tags: ['GSoC', 'LLVM']
published: true
---
The end of my Google Summer of Code is approaching,  it is therefore time to
take a breath and to summarize what I've done over the last few months. So
I'll take the opportunity to lead you, step by step, through the various stages
of my project and outline the tasks I've been working on (for a better
understanding you may also have a look at my original
[project proposal](https://docs.google.com/document/d/1s5mmSW965qmOEbHiM3O4XFz-Vd7cy9TxX9RQaTK_SQo/edit?usp=sharing)).

## Making first contact

My very first activities involved finding a way to allow the use of Polly's
optimization capabilities for Julia programs. For this purpose I introduced a
new macro `@polly`  that can be used to explicitly annotate functions which you
want to be optimized by Polly:

```julia
@polly function foo()
   ...
end
```

However, since allowing polyhedral optimization in Julia is still in an
experimental stage this feature will not be enabled by default. You may
therefore have to build Julia from source in order to activate them. The
simplest way will be to setup a Make.user file that contains the following two
lines:

```makefile
LLVM_VER:=svn
USE_POLLY:=1
```

With `USE_POLLY:=1` you tell the build system to activate all the parts that are
necessary to use `@polly`. Currently, this also requires that you build Julia
with the latest version of LLVM, therefore `LLVM_VER:=svn`{:.language-julia} is
needed. This will then download and compile the latest version of LLVM and Polly
to build your Julia executable.

Alternatively, if you want to use a local build of LLVM you may use a `Make.user`
that looks like the following:

```makefile
LLVM_VER:=svn
USE_POLLY:=1
USE_SYSTEM_LLVM:=1
LLVM_CONFIG:=$(YOUR_LLVM_BUILD_DIR)/bin/llvm-config
```

This way, the build system knows you want to use your own LLVM build located at
`YOUR_LLVM_BUILD_DIR`. If you use a static LLVM build you may also want to
include the configuration `USE_LLVM_SHLIB:=0`.

Additionally, I also added a command line option `--polly=no` that can be used
to deactivate Polly without having to manually remove all the `@polly`
declarations from your program which can for example simplify debugging or
performance tracking.

The PRs that are accountable for bringing you this functionality are the
following:

*   In [https://github.com/JuliaLang/julia/pull/16531](https://github.com/JuliaLang/julia/pull/16531)
    the `@polly` macro was introduced and Polly was integrated in Julia's
    LLVM pass-pipeline.
*   With [https://github.com/JuliaLang/julia/pull/16726](https://github.com/JuliaLang/julia/pull/16726)
    the ability was added to automatically download Polly for you.
*   In order for Polly to be able to apply its optimizations it was necessary to
    add additional passes that canonicalize the program in a way such that Polly
    can analyze it more easily. Additionally, after a number of experiments it
    showed that the position of Polly within Julia's pass-pipeline had to be
    refined, also for the reasons of canonicalization. All this was addressed in
    [https://github.com/JuliaLang/julia/pull/17696](https://github.com/JuliaLang/julia/pull/17696).
*   The `--polly` command line option was added in [https://github.com/JuliaLang/julia/pull/18159](https://github.com/JuliaLang/julia/pull/18159).

## Simplifying boolean expressions

For the representation of truth values Julia provides a `Bool` datatype which
it internally represents as 8-bit datatype instead of using a single bit. This
will have interesting consequences when it comes to the lowering of branch
conditions to LLVM IR. For example, consider the following code snippet:

```julia
if (i > 5) & (i < 100)
  ...
end
```

When translated to LLVM IR we would get code that corresponds to the following:

```llvm
%icmp1 = icmp sgt i64 %i, 5
%zext1 = zext i1 %icmp1 to i8
%icmp2 = icmp slt i64 %i, 100
%zext2 = zext i1 %icmp2 to i8
%and = and i8 %zext1, %zext2
%neg = icmp eq i8 %and, 0
br i1 %neg, label else, label then

then:
...

else:
...
```

Since `icmp` instructions deliver results of type `i1` (which, as its name
suggests, has a bit-width of one) Julia will insert additional `zext`
instructions to make them conform to their 8-bit `Bool` representation. The
noise introduced by these cast operations also limits Polly's abilities to
optimize such code parts. For example, consider the following loop:

```julia
for i in i:length(A)
    if (i > 5) & (i < 100)
        A[i] = 0
    else
        A[i] = 1
    end
end
```

Due to the presence of the casts, Polly would not be able to analyze the branch
condition. Thus, when the polyhedral representation constructed this code region
would have to be conservatively overapproximated which would lead to an atomic
polyhedral statement for the whole loop body:

```
Stmt_if__TO___backedge
    Domain :=
        [p_0] -> { Stmt_if__TO__L_backedge[i0] : 0 <= i0 < p_0 };
    Schedule :=
        [p_0] -> { Stmt_if__TO__L_backedge[i0] -> [0] };
    ReadAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_if__TO__L_backedge[i0] -> MemRef_0[0] };
    MayWriteAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_if__TO__L_backedge[i0] -> MemRef_9[4i0] };
    ReadAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_if__TO__L_backedge[i0] -> MemRef_0[0] };
    MayWriteAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_if__TO__L_backedge[i0] -> MemRef_21[4i0] };
```

Having a second look at the above IR code, one might wonder why these cast
operations can't actually be removed by LLVM since they seem somehow redundant
in this context. After investigating this a bit it turned out that this is
actually a missed optimization in LLVM's <code>InstCombine</code>  pass. I
therefore took the chance to enhance <code>InstCombine</code> with an
according transformation. On our above example, it would push the casts on the
`icmp` operations after the `and` which would bring us the following code:

```llvm
%icmp1 = icmp sgt i64 %i, 5
%icmp2 = icmp slt i64 %i, 100
%and = and i1 %icmp1, %icmp2
%zext = zext i1 %and to i8
%neg = icmp eq i8 %zext, 0
br i1 %neg, label else, label then
```

Finally, `InstCombine` would then be able to totally remove the remaining
`zext`, leading us to:

```llvm
%icmp1 = icmp sgt i64 %i, 5
%icmp2 = icmp slt i64 %i, 100
%and = and i1 %icmp1, %icmp2
%neg = icmp eq i1 %and, 0
br i1 %neg, label else, label then
```

With this change, Polly is now also able to correctly analyze the branch
condition and extracts two separate polyhedral statements for the given code
region:

```
Stmt_then
    Domain :=
        [p_0] -> { Stmt_if4[i0] : 0 <= i0 <= 99 and i0 < p_0 };
    Schedule :=
        [p_0] -> { Stmt_if4[i0] -> [i0, 1] };
    MustWriteAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_if4[i0] -> MemRef_16[i0] };
Stmt_else
    Domain :=
        [p_0] -> { Stmt_L1[i0] : 100 <= i0 < p_0 };
    Schedule :=
        [p_0] -> { Stmt_L1[i0] -> [i0, 0] };
    MustWriteAccess :=	[Reduction Type: NONE] [Scalar: 0]
        [p_0] -> { Stmt_L1[i0] -> MemRef_9[i0] };
```

The relevant patches for this change are the following:

*   Prior to adding the actual code for this optimization I had to do some
    cleanup in the affected code parts of `InstCombine` in
    [https://reviews.llvm.org/D22449](https://reviews.llvm.org/D22449)

*   Then, in [https://reviews.llvm.org/D22864](https://reviews.llvm.org/D22864)
    the described transformation could be enabled.

## Supporting iteration

Julia provides a flexible way to implement sequential iteration over a certain
range of values based on its iteration interface which is defined by the three
methods `start()`, `next()`, and `done()`. This interface is actually also an
important conceptual aspect used to provide you with the concise `for` loop
syntax (examples adopted from the
[Julia manual](http://docs.julialang.org/en/release-0.4/manual/interfaces/#iteration)):

```julia
for i in iter   # or  "for i = iter"
    # body
end
```

which is, in effect, only syntactic sugar for

```julia
state = start(iter)
while !done(iter, state)
    (i, state) = next(iter, state)
    # body
end
```

Two very essential types, that implement this interface, are `UnitRange` and
`StepRange` which enable you to write

```julia
for i in 1:n
    ...
end
```

to iterate over the values from `1` to `n` or

```julia
for i in 1:2:n
    ...
end
```

if you only want to extract every second value in this range. Actually, `1:n`
is just a shortcut for `UnitRange(1,n)` and `1:2:n` for `StepRange(1,2,n)`.
However, their current implementation makes it difficult for Polly to derive the
bounds of loops which iterate over such ranges. Therefore, I've supplied the
alternative types `Polly.UnitRange` and `Polly.StepRange` which are implemented
in a way that helps Polly to derive loop bounds more easily. But still it is not
necessary to use those ranges explicitly and write

```julia
for i in Polly.UnitRange(1,n)
    ...
end
```

or

```julia
for i in Polly.StepRange(1,2,n)
    ...
end
```

Instead, loops that are part of a `@polly` annotated function will
automatically be rewritten for you to use the new ranges (i.e. `1:n` would
automatically be replaced by `Polly.UnitRange(1,n)`).

The PR that provides the according functionality can be viewed at
[https://github.com/JuliaLang/julia/pull/17965](https://github.com/JuliaLang/julia/pull/17965)
(unfortunately it has not yet found its way to be merged into Julia's main
repository).

## Eliminating bounds checks

By default, Julia will create for each array access a corresponding bounds check
to make sure that there won't be touched any memory outside the array. That
means for an array access as simple as

```julia
A[i] = 0
```

Julia would actually produce code like

```julia
if (i < 1 | i > size(A,1))
    throw BoundsError()
end
A[i] = 0
```

These checks come at a cost, since they introduce additional overhead at
run-time, especially when they occur inside loops. Through analyzing the
conditions of such checks, Polly has the ability to detect and eliminate such
bounds checks or at least hoist them outside of a loop if it would be redundant
to execute them over and over again. At the moment, however, Polly's ability to
do so is limited by the way these checks are lowered to LLVM IR. The error
branches of such bounds checks will result in basic blocks that are terminated
by `unreachable` instructions. These instructions currently restrict LLVM's
`RegionInfo` analysis in finding single entry single exit regions in such
programs. There already exists a patch to tackle this problem (
[https://reviews.llvm.org/D12676](https://reviews.llvm.org/D12676), authored by
Tobias Grosser) but unfortunately it has not yet been upstreamed.

However, I based my further work on this patch in order to proceed in enabling
the actual bounds check elimination (my rebased version of the patch can be
found at top of the following branch of my LLVM fork:
[https://github.com/MatthiasJReisinger/llvm/commits/post-dom-fix](https://github.com/MatthiasJReisinger/llvm/commits/post-dom-fix</a>)).
Furthermore, experimenting with this patch helped to identify a bug in Polly's
schedule building algorithm which I resolved on the following branch of my Polly
fork: [https://github.com/MatthiasJReisinger/polly/tree/boundchecks](https://github.com/MatthiasJReisinger/polly/tree/boundchecks).

With these adaptions it is already possible to effectively eliminate bounds
checks for accessing one-dimensional arrays. However, when approaching the
elimination of bounds checks for array accesses that involve multiple dimensions
another obstacle shows up. For example, an access `A[i,j,k]` to a
three-dimensional array `A` would involve the following bounds checks:

```julia
if (i > size(A,1))
    throw BoundsError()
elseif (j > size(A,2))
    throw BoundsError()
elseif (((k * size(A,2) + j) * size(A,1) + i) > length(A))
    throw BoundsError()
end
```

The last of these checks is problematic since it involves the non-affine
expression `((k * size(A,2) + j) * size(A,1) + i)`. Polly is not able to analyze
expressions of such a form which would also prevent it from applying its bounds
check elimination capabilities on such code parts. I therefore adapted Julia's
bounds check emission to generate simpler code of the following form:

```julia
if (i > size(A,1))
    throw BoundsError()
elseif (j > size(A,2))
    throw BoundsError()
elseif (k > size(A,3))
    throw BoundsError()
end
```

The corresponding PR for this adaption can be found at
[https://github.com/JuliaLang/julia/pull/18064](https://github.com/JuliaLang/julia/pull/18064).

## PolyBench.jl

As I already described in my previous blog post, as part of my work I ported the
[PolyBench 4.1](http://web.cse.ohio-state.edu/~pouchet/software/polybench/)
benchmark suite to Julia which is now available as the Julia package
[PolyBench.jl](https://github.com/MatthiasJReisinger/PolyBench.jl). Like the
original suite, it contains 30 programs for numerical computations each one in
the form of a Static Control Part (SCoP). One of the major objectives of my work
was to maximize the number of SCoPs that are fully detected by Polly. The below
table shows how my contributions helped to increase this number for
PolyBench.jl:

|                            | Start of GSoC  | Now  |
|----------------------------|---------------:|-----:|
| **bounds checks enabled**  |              0 |   27 |
| **bounds checks disabled** |             19 |   28 |

The increase in detected SCoPs in the presence of bounds checks is due to the
above described simplification of the bounds check emission in Julia' code
generator. For deactivated bounds checks the achieved gains are mostly due to
the refinements of Julia's LLVM pass-pipeline and the introduction of
`Polly.UnitRange` and `Polly.StepRange`.

## Further contributions

Besides the actual work on the project itself I also fixed some minor
compatibility issues of Julia with newer LLVM versions:

*   [https://github.com/JuliaLang/julia/pull/16275](https://github.com/JuliaLang/julia/pull/16275)
*   [https://github.com/JuliaLang/julia/pull/17665](https://github.com/JuliaLang/julia/pull/17665)

## Wrapping up

Julia is now able to make use of Polly's optimization abilities but there are
yet problems to be solved in order to leverage its full power for a wide range
of application scenarios. In the end, I hope that with my contributions I could
clear the way for further work and I would sure be glad to help, also in the
future, to improve the experience of using polyhedral optimization within Julia.
