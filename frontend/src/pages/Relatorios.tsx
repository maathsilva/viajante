import { useState, useRef } from "react";
import { uploadExcelFile, fetchReservasMensal } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Loader2, BarChart, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SQL_REPORT_DOWNLOAD_URL = "http://127.0.0.1:8000/generate/sql-report";

export default function RelatoriosPage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadFileName, setUploadFileName] = useState<string>("");
    const [dataUploaded, setDataUploaded] = useState(false);

    const [reportPreview, setReportPreview] = useState<{ headers: string[]; data: any[] } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handlePreviewReport = async () => {
        setPreviewLoading(true);
        try {
            const result = await fetchReservasMensal();
            
            if (result.length > 0) {
                setReportPreview({
                    headers: Object.keys(result[0]),
                    data: result.slice(0, 15)
                });
            } else {
                setReportPreview(null);
            }
        } catch (error) {
             setReportPreview(null);
        } finally {
            setPreviewLoading(false);
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/i)) {
             toast({ variant: "destructive", title: "Arquivo Inválido", description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)." });
            return;
        }

        setIsUploading(true);
        setUploadFileName(file.name);
        setDataUploaded(false);
        setReportPreview(null); 

        toast({
            title: "Upload iniciado",
            description: `Enviando ${file.name} para o servidor...`,
        });

        try {
            await uploadExcelFile(file);
            
            toast({
                variant: "default",
                className: "bg-green-600 text-white", // Manter verde para sucesso
                title: "Sucesso!",
                description: `Banco de dados atualizado. Pré-visualizando dados...`,
            });
            setDataUploaded(true);
            handlePreviewReport();
            
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro Crítico no Servidor", description: error.message });
            setDataUploaded(false);
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = "";
        }
    };
    
    
    const handleGenerateReport = async () => {
        setIsGenerating(true);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const downloadLink = document.createElement('a');
        downloadLink.href = SQL_REPORT_DOWNLOAD_URL;
        downloadLink.download = "relatorio_sql_viajante.sql"; 
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast({ title: "Relatório Gerado", description: "O download do arquivo 'relatorio_sql_viajante.sql' foi iniciado." });
        
        setIsGenerating(false);
    };

    const getStatusContent = () => {
        if (isGenerating) return <div className="text-primary font-medium flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Gerando o arquivo .sql...</div>;
        if (dataUploaded) return <div className="text-green-600 font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Base pronta. Clique para gerar o relatório.</div>;
        return <div className="text-sm text-destructive">* Faça o upload da base (Passo 1) antes de gerar.</div>;
    }


    return (
        <div className="flex flex-col gap-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <div>
                <h1 className="text-3xl font-bold">Gerador de Relatório SQL</h1>
                <p className="text-lg text-muted-foreground">
                    Faça o upload da base de dados para gerar o relatório SQL final do desafio.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Passo 1: Enviar Base</CardTitle>
                        <CardDescription>
                            Envie o arquivo <span className="font-semibold">base_agencia.xlsx</span> para o servidor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={handleUploadClick} 
                            disabled={isUploading} 
                            variant="default"
                            className="w-full text-base h-12"
                        >
                            {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            {isUploading ? "Enviando..." : (dataUploaded ? "Enviar Nova Base" : "Selecionar Arquivo")}
                        </Button>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                        {uploadFileName ? `Arquivo: ${uploadFileName}` : 'Aguardando seleção...'}
                    </CardFooter>
                </Card>
                
                <Card className="bg-primary/5 border-primary/50 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Passo 2: Baixar Relatório</CardTitle>
                        <CardDescription>
                            Gera o <span className="font-semibold">relatorio_sql_viajante.sql</span> com as 5 consultas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button
                            onClick={handleGenerateReport}
                            disabled={!dataUploaded || isGenerating}
                            variant="primary"
                            className="w-full text-base font-bold h-12"
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            {isGenerating ? "Gerando Arquivo..." : "Baixar Relatório .SQL"}
                        </Button>
                    </CardContent>
                    <CardFooter className="text-sm font-medium">
                        {getStatusContent()}
                    </CardFooter>
                </Card>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary"/>
                        Pré-Visualização: Receita Mensal (Pergunta A)
                    </CardTitle>
                    <CardDescription>
                       Uma prévia dos dados (até 15 linhas) após o upload da base.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PreviewTable 
                        preview={reportPreview} 
                        isLoading={previewLoading} 
                        dataUploaded={dataUploaded} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}

// Props atualizadas para incluir dataUploaded
interface PreviewTableProps {
    preview: { headers: string[]; data: any[] } | null;
    isLoading: boolean;
    dataUploaded: boolean;
}

function PreviewTable({ preview, isLoading, dataUploaded }: PreviewTableProps) {
    
    if (isLoading) {
        return (
             <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        );
    }
    
    if (!preview || preview.data.length === 0) {
        return (
             <div className="text-center text-muted-foreground py-8 border rounded-md bg-secondary/50">
                {dataUploaded ? "Nenhum dado encontrado para pré-visualização." : "Faça o upload do Excel para ver a prévia."}
            </div>
        );
    }

    const formatCell = (value: any): string => {
        if (typeof value === "number") {
            if (value > 1000 || String(value).includes('.')) { 
               return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        }
        if (value === null || value === undefined) {
            return "N/A";
        }
        return String(value).replace("T00:00:00", "");
    };

    return (
        <div className="border rounded-md overflow-x-auto shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                        {preview.headers.map((header) => (
                            <TableHead key={header} className="capitalize whitespace-nowrap text-primary font-semibold">
                                {header.replace(/_/g, " ")}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {preview.data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {preview.headers.map((header) => (
                                <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap">
                                    {formatCell(row[header])}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}