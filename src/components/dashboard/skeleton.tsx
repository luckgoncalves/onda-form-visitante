import { Card, CardContent, CardHeader } from "../ui/card";

export function CardSkeleton () {
    return (
    <Card className="h-full animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  );
}

// Adicione este componente de loading para os gráficos
export function ChartSkeleton () {
    return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="h-[400px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4V2M12 22v-2M4 12H2m20 0h-2m-1.645-7.355L17.14 5.86m-10.28 10.28l-1.215 1.215m0-11.495l1.215 1.215m10.28 10.28l1.215 1.215M12 17a5 5 0 100-10 5 5 0 000 10z" />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}