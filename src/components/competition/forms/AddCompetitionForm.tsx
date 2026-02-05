import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { competitionService } from '@/services/competitionService';
import { useToast } from '@/hooks/use-toast';
import { useEvent } from '@/contexts/EventContext';
import { Database } from '@/types/database';
import { Trophy, Layers, Sparkles } from 'lucide-react';

type CompCategory = Database['public']['Enums']['competition_category'];

const competitionSchema = z.object({
    name: z.string().min(3, "Il nome della gara deve avere almeno 3 caratteri"),
    category: z.enum(['solo', 'duo', 'couple', 'group'] as const),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

interface AddCompetitionFormProps {
    eventId: string;
    onSuccess?: () => void;
}

export const AddCompetitionForm: React.FC<AddCompetitionFormProps> = ({ eventId, onSuccess }) => {
    const { refreshEvent } = useEvent();
    const { toast } = useToast();

    const form = useForm<CompetitionFormValues>({
        resolver: zodResolver(competitionSchema),
        defaultValues: {
            name: '',
            category: 'solo',
        },
    });

    const onSubmit = async (values: CompetitionFormValues) => {
        try {
            await competitionService.create({
                event_id: eventId,
                name: values.name.trim(),
                category: values.category,
                current_phase: 'registration'
            });

            toast({
                title: "GARA REGISTRATA",
                description: "La competizione è stata configurata con successo nel sistema.",
                className: "bg-navy border-gold text-white font-display"
            });
            await refreshEvent();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast({
                title: "ERRORE DI SISTEMA",
                description: "Impossibile aggiungere la gara. Riprova tra istanti.",
                variant: "destructive"
            });
        }
    };

    return (
        <DialogContent className="max-w-md border-white/5 bg-background shadow-2xl rounded-[2.5rem]">
            <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl font-display font-black text-navy flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-gold animate-in zoom-in duration-700" />
                    NUOVA GARA CLOUD
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-navy/40 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-gold" />
                                    Nome della Competizione
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="es. Under 10 Solo Open"
                                        className="h-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all text-sm font-medium"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-navy/40 flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-gold" />
                                    Tipologia / Categoria
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all duration-300 text-sm font-medium">
                                            <SelectValue placeholder="Seleziona tipologia" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-white/5 shadow-2xl">
                                        <SelectItem value="solo" className="py-3 focus:bg-navy focus:text-white rounded-xl">Solo (Individuale)</SelectItem>
                                        <SelectItem value="duo" className="py-3 focus:bg-navy focus:text-white rounded-xl">Duo</SelectItem>
                                        <SelectItem value="couple" className="py-3 focus:bg-navy focus:text-white rounded-xl">Coppia</SelectItem>
                                        <SelectItem value="group" className="py-3 focus:bg-navy focus:text-white rounded-xl">Gruppo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-14 bg-navy hover:bg-navy-light text-white font-display font-black tracking-[0.15em] text-xs rounded-2xl shadow-xl shadow-navy/20 hover:scale-[1.01] transition-all duration-300 mt-4"
                        loading={form.formState.isSubmitting}
                    >
                        REGISTRA GARA NEL CLOUD
                    </Button>
                </form>
            </Form>
        </DialogContent>
    );
};
