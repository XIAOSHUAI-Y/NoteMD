// 集成 CodeMirror 6 代码编辑器
import { useEffect, useState, useRef } from 'react';
// 管理 CodeMirror 的状态（包括文档内容、扩展等）
import { EditorState } from '@codemirror/state';
// 负责视图层，提供编辑器的 DOM 渲染和行为逻辑。
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
// 提供默认快捷键绑定和撤销/重做历史功能。
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
// 提供默认快捷键绑定和撤销/重做历史功能
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle  } from '@codemirror/language';
// 支持 JavaScript 语法高亮和语言智能。
import { javascript } from '@codemirror/lang-javascript';
import type React from 'react';

interface Props {
	initialDoc: string;
	onChange?: (state: EditorState) => void;
}

const useCodeMirror = <T extends Element>(
  props: Props
): [React.RefObject<T | null>, EditorView?] => {
  // 创建 ref 用于挂载编辑器 DOM
  const refContainer = useRef<T>(null);
  
  // 编辑器实例状态
  const [editorView, setEditorView] = useState<EditorView | undefined>(undefined);
  
  // 从 props 解构 onChange 回调
  const { onChange } = props;

  // 初始化编辑器的副作用
  useEffect(() => {
    // 如果 ref 未准备好，直接返回
    if (!refContainer.current) return;

    // 创建编辑器初始状态
    const startState = EditorState.create({
      doc: props.initialDoc,  // 设置初始文档内容
      extensions: [          // 配置编辑器扩展功能
        // 快捷键绑定（默认快捷键+历史记录快捷键）
        keymap.of([...defaultKeymap, ...historyKeymap]),
        
        // 显示行号
        lineNumbers(),
        
        // 高亮当前行行号
        highlightActiveLineGutter(),
        
        // 历史记录功能（撤销/重做）
        history(),
        
        // 自动缩进
        indentOnInput(),
        
        // 括号匹配
        bracketMatching(),
        
        // 语法高亮
        syntaxHighlighting(defaultHighlightStyle),
        
        // 高亮当前行
        highlightActiveLine(),
        
        // JavaScript 语言支持
        javascript(),
        
        // 自动换行
        EditorView.lineWrapping,
        
        // 内容变化监听器
        EditorView.updateListener.of((update) => {
          if (update.changes) {
            onChange?.(update.state);  // 调用变化回调
          }
        }),
      ],
    });

    // 创建编辑器视图实例
    const view = new EditorView({
      state: startState,      // 设置初始状态
      parent: refContainer.current,  // 挂载到 DOM 元素
    });

    // 保存编辑器实例到状态
    setEditorView(view);

    // 清理函数：组件卸载时销毁编辑器
    return () => view.destroy();
  }, [refContainer]);  // 依赖项：仅在 ref 变化时重新初始化

  // 返回 ref 和编辑器实例
  return [refContainer, editorView];
};

export default useCodeMirror;
