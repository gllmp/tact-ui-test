import React, { useCallback } from "react";
import { useIntl, AVAILABLE_LOCALES } from "./IntlProvider";

const LanguageSelector: React.FC = () => {
  const { locale, switchTo } = useIntl();
  const selectLocale = useCallback<(lang: AVAILABLE_LOCALES) => React.MouseEventHandler>(
    (lang) => () => {
      if (lang !== locale) switchTo(lang);
    },
    [locale, switchTo]
  );
  const Locale = useCallback<React.FC<{ lang: AVAILABLE_LOCALES }>>(
    ({ lang }) => (
      <span
        onClick={selectLocale(lang)}
        style={{
          fontWeight: locale === lang ? 600 : 400,
          cursor: "pointer",
        }}
      >
        {lang[0].toUpperCase() + lang[1].toLowerCase()}
      </span>
    ),
    [locale, selectLocale]
  );
  return (
    <div>
      <Locale lang="fr" /> | <Locale lang="en" />
    </div>
  );
};

export default LanguageSelector;
