import { useCallback, useState } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { Download, Image, FileImage, FileCode, Loader2, ChevronDown } from 'lucide-react';

type ExportFormat = 'png' | 'jpg' | 'svg';

interface ExportOption {
    format: ExportFormat;
    label: string;
    icon: typeof Image;
    mimeType: string;
}

const exportOptions: ExportOption[] = [
    { format: 'png', label: 'PNG', icon: Image, mimeType: 'image/png' },
    { format: 'jpg', label: 'JPG', icon: FileImage, mimeType: 'image/jpeg' },
    { format: 'svg', label: 'SVG', icon: FileCode, mimeType: 'image/svg+xml' },
];

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

/**
 * Export panel component for saving diagram as image
 */
export function ExportPanel() {
    const [isExporting, setIsExporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const { getNodes } = useReactFlow();

    const downloadImage = useCallback((dataUrl: string, format: ExportFormat) => {
        const a = document.createElement('a');
        a.setAttribute('download', `uml-diagram.${format}`);
        a.setAttribute('href', dataUrl);
        a.click();
    }, []);

    const handleExport = useCallback(async (format: ExportFormat) => {
        const nodes = getNodes();

        if (nodes.length === 0) {
            return;
        }

        setIsExporting(true);
        setShowOptions(false);

        try {
            // Get the React Flow viewport element
            const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;

            if (!viewportElement) {
                throw new Error('Could not find viewport element');
            }

            // Calculate bounds for all nodes
            const nodesBounds = getNodesBounds(nodes);
            const viewport = getViewportForBounds(
                nodesBounds,
                IMAGE_WIDTH,
                IMAGE_HEIGHT,
                0.5,
                2,
                0.2
            );

            // Common options for all formats
            const options = {
                backgroundColor: '#0f172a', // slate-900
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                style: {
                    width: String(IMAGE_WIDTH),
                    height: String(IMAGE_HEIGHT),
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            };

            let dataUrl: string;

            switch (format) {
                case 'png':
                    dataUrl = await toPng(viewportElement, options);
                    break;
                case 'jpg':
                    dataUrl = await toJpeg(viewportElement, { ...options, quality: 0.95 });
                    break;
                case 'svg':
                    dataUrl = await toSvg(viewportElement, options);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            downloadImage(dataUrl, format);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [getNodes, downloadImage]);

    const nodes = getNodes();
    const hasNodes = nodes.length > 0;

    return (
        <div className="absolute top-4 right-4 z-10">
            <div className="relative">
                {/* Main Export Button */}
                <button
                    onClick={() => hasNodes && setShowOptions(!showOptions)}
                    disabled={!hasNodes || isExporting}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-lg ${hasNodes && !isExporting
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                            : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                        }`}
                    title={hasNodes ? 'Export diagram as image' : 'Generate a diagram first'}
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">Export</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {showOptions && hasNodes && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden">
                        {exportOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.format}
                                    onClick={() => handleExport(option.format)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors"
                                >
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <span>Save as {option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
