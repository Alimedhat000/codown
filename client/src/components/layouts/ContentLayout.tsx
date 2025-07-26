import { Head } from '../ui/seo';

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
