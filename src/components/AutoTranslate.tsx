import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from '../contexts/TranslationContext';

const originalTextNodes = new WeakMap<Text, string>();
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SVG', 'CANVAS']);

const shouldTranslateText = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length <= 1) return false;
  if (/^[\d\s.,:;+\-()[\]$/%]+$/.test(trimmed)) return false;
  return /[A-Za-z]/.test(trimmed);
};

const getOriginalAttribute = (element: Element, attribute: string) => {
  const key = `data-original-${attribute}`;
  const currentValue = element.getAttribute(attribute) || '';

  if (!element.hasAttribute(key)) {
    element.setAttribute(key, currentValue);
  }

  return element.getAttribute(key) || currentValue;
};

const restoreEnglish = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    const original = originalTextNodes.get(node);
    if (original !== undefined) {
      node.nodeValue = original;
    }
    node = walker.nextNode() as Text | null;
  }

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    root.querySelectorAll(`[data-original-${attribute}]`).forEach((element) => {
      const original = element.getAttribute(`data-original-${attribute}`);
      if (original !== null) {
        element.setAttribute(attribute, original);
      }
    });
  });
};

function AutoTranslate(): null {
  const location = useLocation();
  const { currentLanguage, translateMany, setIsTranslating } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    let rerunTimeout = 0;

    const translatePage = async () => {
      const root = document.body;

      if (currentLanguage === 'en') {
        restoreEnglish(root);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);

      const textNodes: Array<{ node: Text; original: string; key: string }> = [];
      const attributeNodes: Array<{ element: Element; attribute: string; original: string }> = [];
      const textsToTranslate: string[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-no-translate="true"]')) return NodeFilter.FILTER_REJECT;
          return shouldTranslateText(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      let textNode = walker.nextNode() as Text | null;
      while (textNode) {
        const original = originalTextNodes.get(textNode) ?? textNode.nodeValue ?? '';
        originalTextNodes.set(textNode, original);
        const key = original.trim();

        textNodes.push({ node: textNode, original, key });
        textsToTranslate.push(key);
        textNode = walker.nextNode() as Text | null;
      }

      TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        root.querySelectorAll(`[${attribute}]`).forEach((element) => {
          if (SKIP_TAGS.has(element.tagName) && attribute !== 'placeholder') return;
          if (element.closest('[data-no-translate="true"]')) return;

          const original = getOriginalAttribute(element, attribute);
          if (!shouldTranslateText(original)) return;

          attributeNodes.push({ element, attribute, original });
          textsToTranslate.push(original.trim());
        });
      });

      const translations = await translateMany(textsToTranslate);
      if (cancelled) return;

      textNodes.forEach(({ node, original, key }) => {
        const translated = translations.get(key);
        if (translated) {
          node.nodeValue = original.replace(key, translated);
        }
      });

      attributeNodes.forEach(({ element, attribute, original }) => {
        const translated = translations.get(original.trim());
        if (translated) {
          element.setAttribute(attribute, translated);
        }
      });

      setIsTranslating(false);
    };

    const timeout = window.setTimeout(() => {
      void translatePage();
    }, 100);

    const observer = new MutationObserver(() => {
      if (currentLanguage === 'en') return;
      window.clearTimeout(rerunTimeout);
      rerunTimeout = window.setTimeout(() => {
        void translatePage();
      }, 250);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(rerunTimeout);
      observer.disconnect();
    };
  }, [currentLanguage, location.pathname, location.search, location.hash, translateMany, setIsTranslating]);

  return null;
}

export default AutoTranslate;
