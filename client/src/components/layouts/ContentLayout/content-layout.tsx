import { Head } from '../../ui/Seo';

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
