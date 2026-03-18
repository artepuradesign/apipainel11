import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type IconType = React.ComponentType<{ className?: string }>;

interface PlaceholderSectionProps {
  title: string;
  description?: string;
  icon?: IconType;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  description = "Sem resultado",
  icon: Icon,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          {Icon ? <Icon className="h-5 w-5" /> : null}
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs sm:text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderSection;
