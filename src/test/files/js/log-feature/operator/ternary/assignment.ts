// @ts-nocheck

const foo = 1 + 1 === 2
    ? 'bar'
    : 'baz';

export const c =
  // @ts-expect-error
  typeof React.__COMPILER_RUNTIME?.c === 'function'
    ? // @ts-expect-error
      React.__COMPILER_RUNTIME.c
    : function c(size: number) {
        return React.useMemo<Array<unknown>>(() => {
          const $ = new Array(size);
          for (let ii = 0; ii < size; ii++) {
            $[ii] = $empty;
          }
          // This symbol is added to tell the react devtools that this array is from
          // useMemoCache.
          // @ts-ignore
          $[$empty] = true;
          return $;
        }, []);
      };