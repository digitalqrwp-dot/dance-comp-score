/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Search, UserPlus, X, Loader2, Check, AlertCircle, Sparkles, UserCheck, FileText, Upload, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Athlete } from '@/types/competition';
import { athleteService } from '@/services/athleteService';
import { performanceService } from '@/services/performanceService';
import { documentService } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/database';
import { validateItalianTaxId } from '@/lib/validation';

type CompCategory = Database['public']['Enums']['competition_category'];

const performanceSchema = z.object({
    name: z.string().min(2, "Il titolo è obbligatorio"),
    bibNumber: z.string().optional(),
});

const newAthleteSchema = z.object({
    firstName: z.string().min(2, "Nome obbligatorio"),
    lastName: z.string().min(2, "Cognome obbligatorio"),
    taxId: z.string().refine((val) => validateItalianTaxId(val), "Codice Fiscale non valido"),
    club: z.string().optional(),
});

type PerformanceValues = z.infer<typeof performanceSchema>;
type NewAthleteValues = z.infer<typeof newAthleteSchema>;

interface AddPerformanceFormProps {
    competitionId: string;
    category: CompCategory;
    onSuccess?: () => void;
}

export const AddPerformanceForm: React.FC<AddPerformanceFormProps> = ({ competitionId, category, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Gestione Atleti (Stato separato perché dinamico e basato su ricerca)
    const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Athlete[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showNewAthleteForm, setShowNewAthleteForm] = useState(false);
    const [viewingDocsAthlete, setViewingDocsAthlete] = useState<Athlete | null>(null);
    const [athleteDocs, setAthleteDocs] = useState<any[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);

    const mainForm = useForm<PerformanceValues>({
        resolver: zodResolver(performanceSchema),
        defaultValues: { name: '', bibNumber: '' }
    });

    const athleteForm = useForm<NewAthleteValues>({
        resolver: zodResolver(newAthleteSchema),
        defaultValues: { firstName: '', lastName: '', taxId: '', club: '' }
    });

    // Ricerca atleti asincrona
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await athleteService.search(searchQuery);
                    setSearchResults(results.filter(r => !selectedAthletes.find(sa => sa.id === r.id)));
                } catch (err) {
                    console.error('Errore ricerca:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedAthletes]);

    const handleAddAthlete = (athlete: Athlete) => {
        const max = category === 'solo' ? 1 : category === 'duo' || category === 'couple' ? 2 : 100;
        if (selectedAthletes.length >= max) {
            toast({ title: "Limite Raggiunto", description: `In questa categoria puoi aggiungere massimo ${max} atleti.`, variant: "destructive" });
            return;
        }
        setSelectedAthletes([...selectedAthletes, athlete]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveAthlete = (id: string) => {
        setSelectedAthletes(selectedAthletes.filter(a => a.id !== id));
    };

    const handleCreateAthlete = async (values: NewAthleteValues) => {
        setLoading(true);
        try {
            const created = await athleteService.create({
                first_name: values.firstName,
                last_name: values.lastName,
                club_name: values.club || null,
                tax_id: values.taxId.toUpperCase()
            });
            const athleteWithId = created as Athlete;
            handleAddAthlete(athleteWithId);
            athleteForm.reset();
            setShowNewAthleteForm(false);
            toast({
                title: "ATLETA REGISTRATO",
                description: `${athleteWithId.first_name} aggiunto con successo nell'anagrafica Cloud.`,
                className: "bg-navy border-gold text-white font-display"
            });
        } catch (err: any) {
            toast({ title: "ERRORE COMPLIANCE", description: err.message || "Impossibile creare l'atleta.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadAthleteDocs = async (athlete: Athlete) => {
        setDocsLoading(true);
        try {
            const docs = await documentService.getAthleteDocuments(athlete.id);
            setAthleteDocs(docs);
            setViewingDocsAthlete(athlete);
        } catch (err) {
            toast({ title: "Errore Documenti", description: "Impossibile caricare i documenti dell'atleta.", variant: "destructive" });
        } finally {
            setDocsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!viewingDocsAthlete || !e.target.files?.[0]) return;
        setLoading(true);
        try {
            await documentService.upload(viewingDocsAthlete.id, e.target.files[0], 'Identità');
            loadAthleteDocs(viewingDocsAthlete);
            toast({ title: "DOCUMENTO CARICATO", description: "File salvato nell'archivio Cloud.", className: "bg-navy border-gold text-white font-display" });
        } catch (err) {
            toast({ title: "Errore Caricamento", description: "Impossibile salvare il documento.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: PerformanceValues) => {
        if (selectedAthletes.length === 0) {
            toast({ title: "ATLETI MANCANTI", description: "Aggiungi almeno un atleta alla performance.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await performanceService.create({
                competition_id: competitionId,
                name: values.name.trim(),
                category: category,
                bib_number: values.bibNumber ? parseInt(values.bibNumber) : null
            }, selectedAthletes.map(a => a.id));

            toast({
                title: "ISCRIZIONE COMPLETATA",
                description: `La performance "${values.name}" è ora attiva nel Cloud.`,
                className: "bg-navy border-gold text-white font-display"
            });
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast({ title: "ERRORE CRITICO", description: "Impossibile salvare l'iscrizione.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const maxAthletes = category === 'solo' ? 1 : category === 'duo' || category === 'couple' ? 2 : 100;
    const canAddMore = selectedAthletes.length < maxAthletes;

    return (
        <DialogContent className="max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border-white/5 bg-background shadow-xl rounded-2xl">
            <DialogHeader className="pb-2 border-b border-navy/5">
                <DialogTitle className="text-xl font-display font-black text-navy flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-gold animate-in zoom-in duration-700" />
                    ISCRIZIONE {category.toUpperCase()}
                </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1 space-y-8 pt-6 custom-scrollbar">
                <Form {...mainForm}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <FormField
                            control={mainForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-gold animate-pulse" />
                                        Titolo Performance
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="es. Fire in the Sky" className="h-10 border-navy/5 bg-slate-50/50 focus:bg-white shadow-inner transition-all duration-300" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={mainForm.control}
                            name="bibNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
                                        Pettorale (BIB)
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="101" className="h-10 border-navy/5 bg-slate-50/50 focus:bg-white shadow-inner transition-all duration-300" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/60">
                            ATLETI COINVOLTI <span className="text-gold font-sans">({selectedAthletes.length}/{maxAthletes})</span>
                        </Label>
                        {canAddMore && !showNewAthleteForm && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNewAthleteForm(true)}
                                className="text-[10px] font-bold uppercase tracking-widest h-8 border-gold/30 hover:border-gold hover:bg-gold/5 transition-all rounded-full shadow-sm"
                            >
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Nuova Anagrafica
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50/80 border border-navy/5 min-h-[60px] items-center shadow-inner">
                        {selectedAthletes.length === 0 && (
                            <span className="text-[11px] text-slate-400 font-medium tracking-wide px-3 opacity-60">
                                Nessun atleta aggiunto. Ricerca nel Cloud o creane uno nuovo.
                            </span>
                        )}
                        {selectedAthletes.map(athlete => (
                            <Badge key={athlete.id} variant="secondary" className="pl-4 pr-1.5 py-2 gap-3 bg-white border-navy/5 text-navy shadow-sm rounded-full transition-all hover:border-gold group/badge">
                                <span className="font-sans font-bold tracking-tight">{athlete.first_name} {athlete.last_name}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => loadAthleteDocs(athlete)} className="p-1 hover:bg-navy/5 rounded-full text-navy/40 hover:text-navy transition-all">
                                        <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleRemoveAthlete(athlete.id)} className="p-1 hover:bg-destructive/10 rounded-full text-destructive transition-all group-hover/badge:scale-110">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </Badge>
                        ))}
                    </div>

                    {showNewAthleteForm ? (
                        <div className="p-4 rounded-2xl border-2 border-gold/10 bg-gold/5 backdrop-blur-sm animate-in zoom-in-95 duration-500 overflow-hidden shadow-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 animate-spin-slow" /> REGISTRAZIONE ATLETA CLOUD
                            </h3>
                            <Form {...athleteForm}>
                                <form onSubmit={athleteForm.handleSubmit(handleCreateAthlete)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={athleteForm.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] uppercase font-bold opacity-60">Nome</FormLabel>
                                                    <FormControl><Input className="h-10 border-white/40" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={athleteForm.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] uppercase font-bold opacity-60">Cognome</FormLabel>
                                                    <FormControl><Input className="h-10 border-white/40" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={athleteForm.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[9px] uppercase font-bold opacity-60">Codice Fiscale</FormLabel>
                                                <FormControl><Input className="h-10 border-white/40 uppercase" placeholder="RSSMRA..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={athleteForm.control}
                                        name="club"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[9px] uppercase font-bold opacity-60">Club/Scuola</FormLabel>
                                                <FormControl><Input className="h-10 border-white/40" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="flex-1 bg-gold hover:bg-gold-dark text-white font-black text-[10px] tracking-widest rounded-xl"
                                            loading={loading}
                                        >
                                            SALVA IN ANAGRAFICA
                                        </Button>
                                        <Button size="sm" variant="ghost" className="rounded-xl text-[10px]" onClick={() => { athleteForm.reset(); setShowNewAthleteForm(false); }}>ANNULLA</Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    ) : canAddMore && (
                        <div className="relative animate-in fade-in duration-500">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20">
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Search className="w-4 h-4" />}
                            </div>
                            <Input
                                className="h-10 pl-10 border-navy/5 bg-slate-50/50 rounded-xl focus:bg-white transition-all text-sm font-medium"
                                placeholder="Cerca atleta nell'anagrafica centrale..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-navy/5 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                    {searchResults.map(athlete => (
                                        <button
                                            key={athlete.id}
                                            className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors border-b last:border-0 border-navy/5"
                                            onClick={() => handleAddAthlete(athlete)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy/40 font-black text-xs">
                                                    {athlete.first_name[0]}{athlete.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-navy">{athlete.first_name} {athlete.last_name}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{athlete.club_name || 'Nessun club'}</p>
                                                </div>
                                            </div>
                                            <Plus className="w-5 h-5 text-gold/30 group-hover:text-gold group-hover:scale-125 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter className="pt-4 border-t border-navy/5 mt-4 px-1">
                <Button variant="ghost" className="rounded-xl font-bold text-navy/40 hover:text-navy" onClick={onSuccess}>CHIUDI</Button>
                <Button
                    className="bg-navy hover:bg-navy-light text-white font-display font-black tracking-widest text-xs h-12 px-6 rounded-xl shadow-lg shadow-navy/20 active:scale-95 transition-all duration-300"
                    disabled={loading || selectedAthletes.length === 0}
                    onClick={mainForm.handleSubmit(onSubmit)}
                    loading={loading}
                >
                    COMPLETA ISCRIZIONE CLOUD
                </Button>
            </DialogFooter>
            <Dialog open={!!viewingDocsAthlete} onOpenChange={() => setViewingDocsAthlete(null)}>
                <DialogContent className="max-w-lg rounded-2xl border-navy/5 bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-display font-black text-navy uppercase tracking-tight flex items-center gap-3">
                            <FileText className="w-6 h-6 text-gold" />
                            DOCUMENTI: {viewingDocsAthlete?.first_name} {viewingDocsAthlete?.last_name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-navy/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Carica nuovo Documento</p>
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                                <div className="h-10 px-6 rounded-xl bg-navy text-white font-display font-black uppercase tracking-widest text-[9px] flex items-center gap-2 hover:scale-105 transition-all">
                                    <Upload className="w-3 h-3 text-gold" />
                                    Scegli File
                                </div>
                            </label>
                        </div>

                        <div className="space-y-3">
                            {athleteDocs.length === 0 ? (
                                <p className="text-center py-8 text-[10px] font-bold text-navy/20 uppercase">Nessun documento in archivio</p>
                            ) : (
                                athleteDocs.map(doc => (
                                    <div key={doc.id} className="p-4 rounded-xl border border-navy/5 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy/40">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-navy">{doc.doc_type}</p>
                                                <p className="text-[9px] text-navy/30 uppercase font-black">{new Date(doc.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={async () => {
                                                const url = await documentService.getUrl(doc.bucket_path);
                                                window.open(url, '_blank');
                                            }}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:text-red-500" onClick={async () => {
                                                if (confirm("Eliminare definitivamente questo documento?")) {
                                                    await documentService.delete(doc.id, doc.bucket_path);
                                                    loadAthleteDocs(viewingDocsAthlete!);
                                                }
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DialogContent>
    );
};
