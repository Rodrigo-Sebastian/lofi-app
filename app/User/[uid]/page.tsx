import UserMain from '../UserMain'
import UserNav from '../UserNav';
import UserResponsiveNav from '../UserResponsiveNav';

export default async function Page({ params }: { params: Promise<{ uid: string }> }) {
  const awaitedParams = await params;
  const { uid } = awaitedParams;

  return (
    <div className='mx-auto max-w-7xl bg-gray-50 p-4'>
      <UserNav />
      <div>
        <UserResponsiveNav />
      </div>
      <UserMain id={uid} />
    </div>
  );
}
