import { deprecate } from '@ember/debug';
import { AST, ASTPlugin, ASTPluginEnvironment } from '@glimmer/syntax';

/**
 @module ember
*/

/**
  Tranforms:

  ```handlebars
  {{#-in-element someElement}}
    {{modal-display text=text}}
  {{/-in-element}}
  ```

  into:

  ```handlebars
  {{#in-element someElement}}
    {{modal-display text=text}}
  {{/in-element}}
  ```

  @private
  @class TransformHasBlockSyntax
*/
export default function transformInElement(env: ASTPluginEnvironment): ASTPlugin {
  let { builders: b } = env.syntax;
  let cursorCount = 0;

  return {
    name: 'transform-in-element',

    visitor: {
      BlockStatement(node: AST.BlockStatement) {
        if (node.path.original === '-in-element') {
          node.path.original = 'in-element';
          node.path.parts = ['in-element'];

          // replicate special hash arguments added here:
          // https://github.com/glimmerjs/glimmer-vm/blob/ba9b37d44b85fa1385eeeea71910ff5798198c8e/packages/%40glimmer/syntax/lib/parser/handlebars-node-visitors.ts#L340-L363
          let hasNextSibling = false;
          let hash = node.hash;
          hash.pairs.forEach(pair => {
            if (pair.key === 'nextSibling') {
              hasNextSibling = true;
            }
          });

          let guid = b.literal('StringLiteral', `%cursor:${cursorCount++}%`);
          let guidPair = b.pair('guid', guid);
          hash.pairs.unshift(guidPair);

          if (!hasNextSibling) {
            let nullLiteral = b.literal('NullLiteral', null);
            let nextSibling = b.pair('nextSibling', nullLiteral);
            hash.pairs.push(nextSibling);
          }

          deprecate('`{{-in-element}}` is private and has been deprecated, use `{{in-element}}` instead', false, {
            id: 'ember-template-compiler.transform-in-element',
            until: '3.6.0',
            url: '' // Needs to be created?
          });
        }
      }
    }
  };
}
