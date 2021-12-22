const {
  sequence,
  alternation,
  pattern,
  character,
  quantifier,
  parse,
} = require('./dist/cjs/development');

const arithmetic = {
  Addition: (feed) => {
    const matcher = sequence(
      arithmetic.Multiplication,
      quantifier(
        sequence(pattern('\\s*(\\+|\\-)\\s*'), arithmetic.Addition),
      ),
    );
    const { cursor } = feed;
    const result = matcher(feed);
    if (result) {
      if (result.value[1].value.length) {
        return {
          type: 'Addition',
          operator: result.value[1].value[0].value[0].value.trim(),
          left: result.value[0],
          right: result.value[1].value[0].value[1],
          start: cursor,
          end: feed.cursor,
        };
      }
      return result.value[0];
    }
    return null;
  },
  Multiplication: (feed) => {
    const matcher = sequence(
      arithmetic.Exponentiation,
      quantifier(
        sequence(pattern('\\s*(\\*|\\/)\\s*'), arithmetic.Multiplication),
      ),
    );
    const { cursor } = feed;
    const result = matcher(feed);
    if (result) {
      if (result.value[1].value.length) {
        return {
          type: 'Multiplication',
          operator: result.value[1].value[0].value[0].value.trim(),
          left: result.value[0],
          right: result.value[1].value[0].value[1],
          start: cursor,
          end: feed.cursor,
        };
      }
      return result.value[0];
    }
    return null;
  },
  Exponentiation: (feed) => {
    const matcher = sequence(
      arithmetic.Unary,
      quantifier(
        sequence(pattern('\\s*\\^\\s*'), arithmetic.Exponentiation),
      ),
    );
    const { cursor } = feed;
    const result = matcher(feed);
    if (result) {
      if (result.value[1].value.length) {
        return {
          type: 'Exponentiation',
          left: result.value[0],
          right: result.value[1].value[0].value[1],
          start: cursor,
          end: feed.cursor,
        };
      }
      return result.value[0];
    }
    return null;
  },
  Unary: (feed) => {
    const matcher = sequence(
      quantifier(pattern('\\s*\\-\\s*'), 0, 1),
      arithmetic.Atom,
    );
    const { cursor } = feed;
    const result = matcher(feed);
    if (result) {
      return {
        type: 'Unary',
        negated: !!result.value[0].value.length,
        value: result.value[1],
        start: cursor,
        end: feed.cursor,
      };
    }
    return null;
  },
  Atom: (feed) => {
    const matcher = alternation(
      arithmetic.Value,
      sequence(pattern('\\s*\\(\\s*'), arithmetic.Addition, pattern('\\s*\\)\\s*')),
    );
    const result = matcher(feed);
    if (result) {
      if (result.type === 'Value') {
        return result.value;
      }
      return result.value[1];
    }
    return null;
  },
  Value: (feed) => {
    const matcher = sequence(pattern('[0-9]*'), character('.'), pattern('[0-9]*'));
    const { cursor } = feed;
    const result = matcher(feed);
    if (result) {
      return {
        type: 'Value',
        value: result.value.map((item) => item.value).join(''),
        start: cursor,
        end: feed.cursor,
      };
    }
    return null;
  },
};


console.dir(parse(
  arithmetic.Addition,
  '1.0 * (2.0 + 3.0) / 4.0',
), {
  depth: null,
});