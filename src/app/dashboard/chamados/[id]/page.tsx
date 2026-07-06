import { redirect } from 'next/navigation';

export default function DashboardChamadoDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/chamados/${params.id}`);
}
