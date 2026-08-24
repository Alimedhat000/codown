import { Head } from '../../ui/Seo';

/**
 * Generic page shell: document head metadata, optional title heading and a padded content region.
 */
export default function ContentLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Head title={title} />
      {children}
    </>
  );
}
