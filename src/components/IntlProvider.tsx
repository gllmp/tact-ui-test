import React, { createContext, useContext, useCallback, useState } from "react";
import { IntlProvider as ReactIntlProvider, useIntl as useReactIntl } from "react-intl";
import defaultMessages from "../lang/fr.json";

export type AVAILABLE_LOCALES = "fr" | "en";

export type IntlContext = {
  switchTo: (locale: AVAILABLE_LOCALES) => Promise<void>;
};

const intlContext = createContext<IntlContext>({
  switchTo: async () => undefined,
});

const IntlProvider: React.FC = ({ children }) => {
  const [{ locale, messages }, setState] = useState({
    locale: "fr",
    messages: defaultMessages,
  });

  const switchTo = useCallback<IntlContext["switchTo"]>(async (locale) => {
    const messages = await import(`../lang/${locale}.json`).then((mod) => mod.default);
    setState({ locale, messages });
  }, []);

  return (
    <intlContext.Provider value={{ switchTo }}>
      <ReactIntlProvider key={locale} locale={locale} defaultLocale="fr" messages={messages}>
        {children}
      </ReactIntlProvider>
    </intlContext.Provider>
  );
};

export const useIntl = (): ReturnType<typeof useReactIntl> & IntlContext => {
  const intl = useReactIntl();
  const { switchTo } = useContext(intlContext);
  return {
    ...intl,
    switchTo,
  };
};

export default IntlProvider;
