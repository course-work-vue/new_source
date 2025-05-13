<template>
  <div class="monaco-editor-wrapper">
    <div v-if="loading" class="editor-loading-overlay">
      <div class="spinner"></div>
      <span>Загрузка редактора...</span>
    </div>
    <div class="editor-toolbar" v-if="!loading && showToolbar">
      <button 
        class="theme-toggle-btn"
        @click="toggleTheme"
        :title="currentTheme.startsWith('pgsql-dark') ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
      >
        <i :class="currentTheme.startsWith('pgsql-dark') ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>
    </div>
    <div ref="editorContainer" class="monaco-editor-container"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import * as monaco from 'monaco-editor';

export default defineComponent({
  name: 'SqlMonacoEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '300px'
    },
    theme: {
      type: String,
      default: 'pgsql-light'
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    showToolbar: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const editorContainer = ref(null);
    const loading = ref(true);
    const currentTheme = ref(props.theme);
    let editor = null;
    
    // Загрузка сохраненной темы из localStorage
    const loadSavedTheme = () => {
      const savedTheme = localStorage.getItem('sqlEditorTheme');
      if (savedTheme) {
        currentTheme.value = savedTheme;
      }
    };
    
    // Сохранение темы в localStorage
    const saveThemePreference = (theme) => {
      localStorage.setItem('sqlEditorTheme', theme);
    };
    
    // Переключение между темной и светлой темами
    const toggleTheme = () => {
      const newTheme = currentTheme.value === 'pgsql-dark' ? 'pgsql-light' : 'pgsql-dark';
      currentTheme.value = newTheme;
      saveThemePreference(newTheme);
      if (editor) {
        monaco.editor.setTheme(newTheme);
      }
    };
    
    // Define custom PostgreSQL-friendly themes
    const defineCustomThemes = () => {
      // PostgreSQL Dark Theme (based on vs-dark with PostgreSQL specific coloring)
      monaco.editor.defineTheme('pgsql-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6a995b', fontStyle: 'italic' },
          { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
          { token: 'operator', foreground: 'd4d4d4' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'string.double', foreground: 'ce9178' },
          { token: 'string.backtick', foreground: 'ce9178' },
          { token: 'predefined', foreground: 'dcdcaa' },
          { token: 'type', foreground: '4ec9b0' },
          { token: 'number', foreground: 'b5cea8' },
          { token: 'delimiter', foreground: 'd4d4d4' },
          { token: 'identifier', foreground: '9cdcfe' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editorLineNumber.foreground': '#858585',
          'editorCursor.foreground': '#d4d4d4',
          'editor.selectionBackground': '#264f78',
          'editor.selectionHighlightBackground': '#333333',
          'editorIndentGuide.background': '#404040',
        }
      });

      // PostgreSQL Light Theme
      monaco.editor.defineTheme('pgsql-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '008000', fontStyle: 'italic' },
          { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
          { token: 'operator', foreground: '000000' },
          { token: 'string', foreground: 'a31515' },
          { token: 'string.double', foreground: 'a31515' },
          { token: 'string.backtick', foreground: 'a31515' },
          { token: 'predefined', foreground: '795e26' },
          { token: 'type', foreground: '267f99' },
          { token: 'number', foreground: '098658' },
          { token: 'delimiter', foreground: '000000' },
          { token: 'identifier', foreground: '001080' },
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000',
          'editorLineNumber.foreground': '#6e6e6e',
          'editorCursor.foreground': '#000000',
          'editor.selectionBackground': '#add6ff',
          'editor.selectionHighlightBackground': '#e5ebf1',
          'editorIndentGuide.background': '#d3d3d3',
        }
      });
    };

    // Define PostgreSQL-specific tokens and syntax
    const configurePgSql = () => {
      monaco.languages.setMonarchTokensProvider('sql', {
        defaultToken: '',
        tokenPostfix: '.sql',
        ignoreCase: true,

        brackets: [
          { open: '[', close: ']', token: 'delimiter.square' },
          { open: '(', close: ')', token: 'delimiter.parenthesis' }
        ],

        keywords: [
          'SELECT', 'FROM', 'WHERE', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING',
          'INSERT', 'INTO', 'VALUES', 'UPDATE', 'DELETE', 'SET', 'CREATE', 'ALTER',
          'DROP', 'TABLE', 'VIEW', 'FUNCTION', 'PROCEDURE', 'TRIGGER', 'INDEX',
          'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT',
          'NOT', 'NULL', 'UNIQUE', 'CHECK', 'AUTOINCREMENT', 'SERIAL', 'IDENTITY',
          'AND', 'OR', 'IN', 'LIKE', 'BETWEEN', 'IS', 'EXISTS', 'ANY', 'ALL',
          'UNION', 'INTERSECT', 'EXCEPT', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
          'ON', 'USING', 'WITH', 'RECURSIVE', 'RETURNING', 'CONFLICT', 'DO',
          'NOTHING', 'TRUE', 'FALSE', 'LIMIT', 'OFFSET', 'FOR', 'OVER', 'PARTITION',
          'RETURNS', 'CASCADE', 'BEGIN', 'END', 'LANGUAGE', 'PLPGSQL', 'JSONB',
          'TIMESTAMP', 'WITHOUT', 'TIME', 'ZONE', 'WITH', 'SCHEMA', 'TYPE', 'ENUM',
          'EXTENSION', 'VACUUM', 'ANALYSE', 'ANALYZE', 'GRANT', 'REVOKE',
          'PRIVILEGES', 'EXPLAIN'
        ],

        operators: [
          // Logical
          'AND', 'OR', 'NOT', 
          // Comparison
          '=', '<>', '<', '>', '<=', '>=', '!=', '!<', '!>', 
          // Bitwise
          '&', '|', '^', '<<', '>>', 
          // Math
          '+', '-', '*', '/', '%',
          // PostgreSQL
          '->>', '->',
          // Misc
          'COLLATE', 'CONCAT', '||'
        ],

        builtinFunctions: [
          'AVG', 'COUNT', 'MIN', 'MAX', 'SUM', 'CURRENT_DATE', 'CURRENT_TIME',
          'CURRENT_TIMESTAMP', 'CURRENT_USER', 'LOWER', 'UPPER', 'SUBSTRING',
          'TO_CHAR', 'TO_DATE', 'TO_NUMBER', 'TO_TIMESTAMP', 'COALESCE', 'NULLIF',
          'CAST', 'EXTRACT', 'DATE_PART', 'NOW', 'RANDOM', 'ROUND', 'CEIL', 'FLOOR',
          'ARRAY', 'JSON_BUILD_OBJECT', 'JSON_BUILD_ARRAY', 'JSONB_BUILD_OBJECT',
          'JSONB_BUILD_ARRAY', 'ARRAY_AGG', 'JSON_AGG', 'JSONB_AGG', 'LENGTH',
          'TRIM', 'POSITION', 'OVERLAY', 'REPLACE', 'REGEXP_MATCH', 'REGEXP_REPLACE',
          'AGE', 'DATE_TRUNC', 'GENERATE_SERIES', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
          'PERCENT_RANK', 'CUME_DIST', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE',
          'LAST_VALUE', 'NTH_VALUE', 'STRING_AGG'
        ],

        dataTypes: [
          'BIGINT', 'BIGSERIAL', 'BIT', 'BOOLEAN', 'BOX', 'BYTEA', 'CHAR',
          'CHARACTER', 'CIDR', 'CIRCLE', 'DATE', 'DECIMAL', 'DOUBLE', 'PRECISION',
          'FLOAT', 'INET', 'INTEGER', 'INTERVAL', 'JSON', 'JSONB', 'LINE', 'LSEG',
          'MACADDR', 'MONEY', 'NUMERIC', 'PATH', 'POINT', 'POLYGON', 'REAL',
          'SMALLINT', 'SMALLSERIAL', 'SERIAL', 'TEXT', 'TIME', 'TIMESTAMP',
          'TSQUERY', 'TSVECTOR', 'UUID', 'VARCHAR', 'XML', 'ARRAY'
        ],

        tokenizer: {
          root: [
            { include: '@comments' },
            { include: '@whitespace' },
            { include: '@numbers' },
            { include: '@strings' },
            { include: '@complexIdentifiers' },
            { include: '@scopes' },
            
            [/[;,.]/, 'delimiter'],
            [/[()]/, '@brackets'],
            [/[\w@#$]+/, {
              cases: {
                '@keywords': 'keyword',
                '@operators': 'operator',
                '@builtinFunctions': 'predefined',
                '@dataTypes': 'type',
                '@default': 'identifier'
              }
            }],
            
            [/[<>=!%&+\-*/|~^]/, 'operator'],
          ],
          
          whitespace: [
            [/\s+/, 'white']
          ],
          
          comments: [
            [/--+.*/, 'comment'],
            [/\/\*/, { token: 'comment.quote', next: '@comment' }],
          ],
          comment: [
            [/[^*/]+/, 'comment'],
            [/\*\//, { token: 'comment.quote', next: '@pop' }],
            [/./, 'comment']
          ],
          
          numbers: [
            [/0[xX][0-9a-fA-F]*/, 'number'],
            [/[$][+-]*\d*(\.\d*)?/, 'number'],
            [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']
          ],
          
          strings: [
            [/'/, { token: 'string', next: '@string' }],
            [/"/, { token: 'string.double', next: '@stringDouble' }],
            [/`/, { token: 'string.backtick', next: '@stringBacktick' }]
          ],
          string: [
            [/[^']+/, 'string'],
            [/''/, 'string'],
            [/'/, { token: 'string', next: '@pop' }],
          ],
          stringDouble: [
            [/[^"]+/, 'string.double'],
            [/""/, 'string.double'],
            [/"/, { token: 'string.double', next: '@pop' }]
          ],
          stringBacktick: [
            [/[^`]+/, 'string.backtick'],
            [/``/, 'string.backtick'],
            [/`/, { token: 'string.backtick', next: '@pop' }]
          ],
          
          complexIdentifiers: [
            [/\[/, { token: 'identifier.quote', next: '@bracketedIdentifier' }],
            [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }]
          ],
          bracketedIdentifier: [
            [/[^\]]+/, 'identifier'],
            [/]]/, 'identifier'],
            [/]/, { token: 'identifier.quote', next: '@pop' }]
          ],
          quotedIdentifier: [
            [/[^"]+/, 'identifier'],
            [/""/, 'identifier'],
            [/"/, { token: 'identifier.quote', next: '@pop' }]
          ],
          scopes: []
        }
      });

      // Configure Postgres-specific completions
      monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: () => {
          const suggestions = [
            ...keywords.map(k => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword })),
            ...operators.map(o => ({ label: o, kind: monaco.languages.CompletionItemKind.Operator })),
            ...builtinFunctions.map(f => ({ 
              label: f, 
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: f.indexOf('(') > 0 ? f : `${f}()`
            })),
            ...dataTypes.map(t => ({ label: t, kind: monaco.languages.CompletionItemKind.Class }))
          ];
          return { suggestions };
        }
      });
    };

    // Postgres-specific keywords for autocompletion
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AS', 'ORDER BY', 'GROUP BY', 'HAVING',
      'INSERT INTO', 'VALUES', 'UPDATE', 'DELETE FROM', 'SET', 'CREATE TABLE',
      'ALTER TABLE', 'DROP TABLE', 'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW',
      'CREATE FUNCTION', 'CREATE TRIGGER', 'CREATE PROCEDURE', 'CREATE SCHEMA',
      'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON', 'USING',
      'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CONSTRAINT', 'DEFAULT',
      'NOT NULL', 'UNIQUE', 'CHECK', 'RETURNING', 'WITH'
    ];

    const operators = [
      '=', '<>', '<', '>', '<=', '>=', 'AND', 'OR', 'LIKE', 'IN', 'BETWEEN', 'IS NULL',
      'IS NOT NULL', 'NOT', 'ALL', 'ANY', 'EXISTS', 'SOME'
    ];

    const builtinFunctions = [
      'COUNT()', 'SUM()', 'AVG()', 'MIN()', 'MAX()', 'ROUND()', 'NOW()', 'CURRENT_DATE',
      'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'EXTRACT()', 'LOWER()', 'UPPER()', 
      'LENGTH()', 'SUBSTRING()', 'TRIM()', 'TO_CHAR()', 'TO_DATE()', 'COALESCE()',
      'NULLIF()', 'GREATEST()', 'LEAST()'
    ];

    const dataTypes = [
      'INTEGER', 'BIGINT', 'SMALLINT', 'CHARACTER VARYING', 'VARCHAR', 'TEXT',
      'TIMESTAMP', 'DATE', 'TIME', 'BOOLEAN', 'DECIMAL', 'NUMERIC', 'REAL',
      'DOUBLE PRECISION', 'JSONB', 'JSON', 'UUID', 'SERIAL', 'BIGSERIAL'
    ];
    
    // Initialize the editor
    onMounted(() => {
      if (!editorContainer.value) return;
      
      // Загрузка сохраненной темы
      loadSavedTheme();
      
      // Set the container height
      editorContainer.value.style.height = props.height;
      
      // Define custom themes
      defineCustomThemes();
      
      // Register the PostgreSQL language definition
      configurePgSql();
      
      // Create the editor instance
      editor = monaco.editor.create(editorContainer.value, {
        value: props.modelValue,
        language: 'sql',
        theme: currentTheme.value,
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        scrollBeyondLastLine: false,
        readOnly: props.readOnly,
        wordWrap: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        folding: true,
        lineNumbers: 'on',
        renderIndentGuides: true,
        formatOnPaste: false,
        formatOnType: false,
        tabSize: 2
      });
      
      // Add change event listener
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        emit('update:modelValue', value);
        emit('change', value);
      });
      
      // Editor is now loaded
      loading.value = false;
    });
    
    // Watch for changes in props
    watch(() => props.modelValue, (newValue) => {
      if (editor && newValue !== editor.getValue()) {
        editor.setValue(newValue);
      }
    });
    
    watch(() => props.readOnly, (newValue) => {
      if (editor) {
        editor.updateOptions({ readOnly: newValue });
      }
    });
    
    watch(() => props.theme, (newValue) => {
      currentTheme.value = newValue;
      if (editor) {
        monaco.editor.setTheme(newValue);
      }
    });
    
    // Clean up on component unmount
    onBeforeUnmount(() => {
      if (editor) {
        editor.dispose();
        editor = null;
      }
    });
    
    return {
      editorContainer,
      loading,
      currentTheme,
      toggleTheme
    };
  }
});
</script>

<style scoped>
.monaco-editor-wrapper {
  position: relative;
  width: 100%;
}

.monaco-editor-container {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 4px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-bottom: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 4px;
  border-radius: 4px;
}

.theme-toggle-btn:hover {
  background-color: #e0e0e0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #446334;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 