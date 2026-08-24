import { Head } from '../../ui/Seo';

/**
 * Generic page shell: document head metadata, optional title heading and a padded content region.
 */
export default function ContentLayout({
  title,
  children,
}: {
  /** Document title set via Head; no visible heading rendered. */
  title: string;
  /** Page content rendered after the head metadata. */
  children: React.ReactNode;
}) {
  return (
    <>
      <Head title={title} />
      {children}
    </>
  );
}
