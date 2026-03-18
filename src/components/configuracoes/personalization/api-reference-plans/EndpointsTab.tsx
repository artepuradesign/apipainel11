
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { plansEndpoints } from './data/endpoints';

export const EndpointsTab = () => {
  return (
    <div className="space-y-4">
      {plansEndpoints.map((endpoint, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {endpoint.endpoint}
                </code>
              </div>
              {endpoint.auth && (
                <Badge variant="outline" className="text-xs">
                  Requer Auth
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {endpoint.description}
            </p>
            {endpoint.parameters.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Parâmetros:</h4>
                <div className="space-y-1">
                  {endpoint.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                        {param.name}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {param.type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {param.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
