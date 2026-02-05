import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { eventService } from '@/services/eventService';
import { useToast } from '@/hooks/use-toast';
import { useEvent } from '@/contexts/EventContext';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

const eventSchema = z.object({
    name: z.string().min(3, "Il nome dell'evento deve avere almeno 3 caratteri"),
    location: z.string().min(2, "Inserisci una località valida"),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
    onSuccess?: () => void;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess }) => {
    const { refreshEvent } = useEvent();
    const { toast } = useToast();

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            location: '',
        },
    });

    const onSubmit = async (values: EventFormValues) => {
        try {
            await eventService.create({
                name: values.name.trim(),
                location: values.location.trim(),
                start_date: new Date().toISOString(),
                status: 'planned'
            });

            toast({
                title: "EVENTO CREATO",
                description: "L'evento è stato registrato con successo nell'anagrafica Cloud.",
                className: "bg-navy border-gold text-white font-display"
            });
            await refreshEvent();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast({
                title: "ERRORE CRITICO",
                description: "Impossibile creare l'evento. Verifica la tua connessione.",
                variant: "destructive"
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-gold" />
                                    Nome Identificativo Evento
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="es. Gran Premio Danza 2024"
                                        className="h-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all duration-300"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-gold" />
                                    Località / Sede Svolgimento
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="es. Roma, Palasport"
                                        className="h-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all duration-300"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-navy hover:bg-navy-light text-white font-display font-black tracking-widest text-xs rounded-2xl shadow-xl shadow-navy/20 hover:scale-[1.01] active:scale-95 transition-all duration-300"
                    loading={form.formState.isSubmitting}
                >
                    INIZIALIZZA NUOVO EVENTO
                </Button>
            </form>
        </Form>
    );
};
