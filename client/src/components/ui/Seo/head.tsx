import { Helmet, HelmetData } from 'react-helmet-async';

type HeadProps = {
  /** Document title; empty string falls back to 'Codown'. */
  title?: string;
  /** Content for the meta description tag. */
  description?: string;
};

const helmetData = new HelmetData({});

/**
 * Sets document title and meta description through react-helmet-async.
 */
export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      helmetData={helmetData}
      title={title ? `${title}` : undefined}
      defaultTitle="Codown"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
